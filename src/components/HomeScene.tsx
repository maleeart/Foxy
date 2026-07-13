"use client";

import { useEffect, useState } from "react";
import { getSupabase, GameState } from "@/lib/supabase";

function hoursSince(ts: string | null) {
  if (!ts) return 999;
  return (Date.now() - new Date(ts).getTime()) / 3_600_000;
}

function todayCount(...timestamps: (string | null)[]) {
  const today = new Date().toISOString().slice(0, 10);
  return timestamps.filter(ts => ts?.slice(0, 10) === today).length;
}

function calcHappiness(state: GameState) {
  const decay = Math.max(0, Math.floor(hoursSince(state.fed_at_1) / 24) - 0) * 20;
  return Math.max(0, Math.min(100, state.dog_happiness - decay));
}

export default function HomeScene({ player }: { player: string }) {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchState();
    const sub = getSupabase()
      .channel("game")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_state" }, (p) => {
        setState(p.new as GameState);
      })
      .subscribe();
    return () => { getSupabase().removeChannel(sub); };
  }, []);

  async function fetchState() {
    const { data } = await getSupabase().from("game_state").select("*").eq("id", 1).single();
    setState(data);
    setLoading(false);
  }

  async function doFeed() {
    if (!state) return;
    const fedToday = todayCount(state.fed_at_1, state.fed_at_2);
    if (fedToday >= 2) { showToast("อิ่มแล้วสำหรับวันนี้ 🐾"); return; }
    const h = hoursSince(state.fed_at_1);
    if (h < 6) { showToast(`ยังไม่หิว อีก ${Math.ceil(6 - h)} ชม. นะ 😊`); return; }
    const now = new Date().toISOString();
    const { data } = await getSupabase().from("game_state")
      .update({ fed_at_2: state.fed_at_1, fed_at_1: now, dog_happiness: Math.min(state.dog_happiness + 25, 100) })
      .eq("id", 1).select().single();
    if (data) setState(data);
    showToast("🦴 อร่อยมาก! +25");
  }

  async function doPlay() {
    if (!state) return;
    triggerPlay();
    const playedToday = todayCount(state.play_at_1, state.play_at_2);
    if (playedToday >= 2) { showToast("เหนื่อยแล้ว เล่นพรุ่งนี้ต่อนะ 😴"); return; }
    const h = hoursSince(state.play_at_1);
    if (h < 6) { showToast("สนุกจัง! ✨"); return; }
    const now = new Date().toISOString();
    const { data } = await getSupabase().from("game_state")
      .update({ play_at_2: state.play_at_1, play_at_1: now, dog_happiness: Math.min(state.dog_happiness + 10, 100) })
      .eq("id", 1).select().single();
    if (data) setState(data);
    showToast("🎾 หมาสนุกมาก! +10");
  }

  function triggerPlay() {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1000);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  const treeScale = 0.7 + (state?.tree_level ?? 1) * 0.03;
  const lv = state?.tree_level ?? 1;
  const happiness = state ? calcHappiness(state) : 100;
  const dogHappy = happiness >= 40;

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "var(--teal)" }}>
      <div className="text-3xl animate-spin">🌀</div>
      <p className="text-sm font-medium">กำลังโหลด...</p>
    </div>
  );

  return (
    <div className="flex flex-col relative select-none" style={{ flex: 1, minHeight: 0, overflow: "hidden", width: "100%" }}>
      {toast && (
        <div className="toast-anim absolute top-4 left-1/2 z-20 bg-white rounded-full px-5 py-2.5 text-sm font-bold shadow-lg"
          style={{ color: "var(--teal-dark)", border: "1.5px solid var(--teal-mid)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Scene — portrait viewBox 390×560 */}
      <div className="relative" style={{ flex: 1, minHeight: 0, width: "100%" }}>
        <svg viewBox="0 0 390 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7BC67E"/>
              <stop offset="100%" stopColor="#5A9E5E"/>
            </linearGradient>
          </defs>

          {/* Background image */}
          <image href="/bg.png" x="0" y="0" width="390" height="560" preserveAspectRatio="xMidYMid slice"/>

          {/* ===== TREE ===== */}
          <g transform={`translate(55,${321 - lv * 3})`}>
            {/* trunk */}
            <rect x="-11" y="82" width="22" height="62" rx="9" fill="#9B7240"/>
            <rect x="-5" y="90" width="5" height="28" rx="3" fill="#B8904A" opacity="0.4"/>
            {/* foliage animated */}
            <g className="tree-sway" style={{ transformOrigin: "0px 82px" }}>
              <g style={{ transform: `scale(${treeScale})`, transformOrigin: "0px 82px" }}>
                <ellipse cx="0" cy="58" rx="58" ry="52" fill="#43A047"/>
                <ellipse cx="0" cy="34" rx="46" ry="40" fill="#4CAF50"/>
                <ellipse cx="0" cy="14" rx="33" ry="30" fill="#66BB6A"/>
                <ellipse cx="0" cy="0" rx="20" ry="20" fill="#81C784"/>
                {lv >= 3 && <><circle cx="-32" cy="50" r="9" fill="#E53935"/><circle cx="-30" cy="50" r="4" fill="#FF5252" opacity="0.6"/></>}
                {lv >= 5 && <><circle cx="28" cy="44" r="8" fill="#FB8C00"/><circle cx="26" cy="44" r="4" fill="#FFA726" opacity="0.6"/></>}
                {lv >= 7 && <><circle cx="6" cy="68" r="7" fill="#FDD835"/><circle cx="4" cy="67" r="3" fill="#FFEE58" opacity="0.6"/></>}
                {/* face */}
                <circle cx="-8" cy="40" r="3.5" fill="#2E7D32"/>
                <circle cx="8" cy="40" r="3.5" fill="#2E7D32"/>
                <path d="M-5,49 Q0,54 5,49" stroke="#2E7D32" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </g>
            </g>
            {/* label */}
            <rect x="-42" y="152" width="84" height="24" rx="12" fill="white" opacity="0.92"/>
            <text x="0" y="168" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#4CAF50" fontWeight="bold">🌳 Lv.{lv}</text>
          </g>

          {/* ===== DOGS (center, large) ===== */}
          <g className={playing ? "dog-jump" : "dog-bob"} style={{ mixBlendMode: "multiply" }}>
            <image href="/beagle.png" x="60" y="300" width="150" height="150" preserveAspectRatio="xMidYMid meet"/>
          </g>
          <g className={playing ? "dog-jump" : "dog-bob"} style={{ mixBlendMode: "multiply", animationDelay: "0.4s" }}>
            <image href="/golden.png" x="200" y="290" width="150" height="150" preserveAspectRatio="xMidYMid meet"/>
          </g>
          {!dogHappy && <text x="195" y="285" textAnchor="middle" fontSize="22">😢</text>}
          {/* happiness bar */}
          <rect x="95" y="462" width="200" height="14" rx="7" fill="white" opacity="0.7"/>
          <rect x="95" y="462" width={200 * happiness / 100} height="14" rx="7"
            fill={happiness >= 60 ? "#4DC5BE" : happiness >= 30 ? "#FFB347" : "#FF6B6B"}/>
          <text x="195" y="490" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="white" fontWeight="bold">🐾 {happiness}%</text>
        </svg>
      </div>

      {/* Action buttons */}
      <div className="bg-white px-4 py-4 flex gap-3" style={{ borderTop: "1.5px solid var(--teal-mid)" }}>
        <button
          onClick={doFeed}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{ background: "var(--beige)", color: "white", boxShadow: "0 4px 12px rgba(200,168,130,0.35)" }}
        >
          🦴 ให้อาหาร
          <span className="text-xs block font-normal mt-0.5 opacity-75">
            {todayCount(state?.fed_at_1 ?? null, state?.fed_at_2 ?? null)}/2 วันนี้
          </span>
        </button>
        <button
          onClick={doPlay}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{ background: "var(--teal)", color: "white", boxShadow: "0 4px 12px rgba(77,197,190,0.35)" }}
        >
          🎾 เล่นด้วย
          <span className="text-xs block font-normal mt-0.5 opacity-75">
            {todayCount(state?.play_at_1 ?? null, state?.play_at_2 ?? null)}/2 แต้ม
          </span>
        </button>
      </div>
    </div>
  );
}
