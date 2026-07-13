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
    const { data, error } = await getSupabase().from("game_state").select("*").eq("id", 1).single();
    if (error) console.error("fetchState error:", error);
    console.log("fetchState data:", data);
    setState(data);
    setLoading(false);
  }

  async function doFeed() {
    console.log("doFeed called, state:", state);
    if (!state) { showToast("ยังโหลดข้อมูลไม่ครบ 🔄"); return; }
    const fedToday = todayCount(state.fed_at_1, state.fed_at_2);
    if (fedToday >= 2) { showToast("อิ่มแล้วสำหรับวันนี้ 🐾"); return; }
    const h = hoursSince(state.fed_at_1);
    if (h < 6) { showToast(`ยังไม่หิว อีก ${Math.ceil(6 - h)} ชม. นะ 😊`); return; }
    const now = new Date().toISOString();
    const { data, error } = await getSupabase().from("game_state")
      .update({ fed_at_2: state.fed_at_1, fed_at_1: now, dog_happiness: Math.min(state.dog_happiness + 25, 100) })
      .eq("id", 1).select().single();
    if (error) { showToast("เกิดข้อผิดพลาด 😢"); console.error("feed error:", error); return; }
    if (data) setState(data);
    showToast("🦴 อร่อยมาก! +25");
  }

  async function doPlay() {
    console.log("doPlay called, state:", state);
    if (!state) { showToast("ยังโหลดข้อมูลไม่ครบ 🔄"); return; }
    triggerPlay();
    const playedToday = todayCount(state.play_at_1, state.play_at_2);
    if (playedToday >= 2) { showToast("เหนื่อยแล้ว เล่นพรุ่งนี้ต่อนะ 😴"); return; }
    const h = hoursSince(state.play_at_1);
    if (h < 6) { showToast("สนุกจัง! ✨"); return; }
    const now = new Date().toISOString();
    const { data, error } = await getSupabase().from("game_state")
      .update({ play_at_2: state.play_at_1, play_at_1: now, dog_happiness: Math.min(state.dog_happiness + 10, 100) })
      .eq("id", 1).select().single();
    if (error) { showToast("เกิดข้อผิดพลาด 😢"); console.error("play error:", error); return; }
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
        <div className="toast-anim fixed top-6 left-1/2 z-50 bg-white rounded-full px-5 py-2.5 text-sm font-bold shadow-lg"
          style={{ color: "var(--teal-dark)", border: "1.5px solid var(--teal-mid)", whiteSpace: "nowrap", transform: "translateX(-50%)" }}>
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

          {/* ===== TREE (decoration) ===== */}
          <g transform="translate(55,318)" className="tree-sway" style={{ transformOrigin: "55px 318px" }}>
            <rect x="-11" y="0" width="22" height="62" rx="9" fill="#9B7240"/>
            <ellipse cx="0" cy="-24" rx="48" ry="44" fill="#43A047"/>
            <ellipse cx="0" cy="-44" rx="38" ry="34" fill="#4CAF50"/>
            <ellipse cx="0" cy="-60" rx="26" ry="24" fill="#66BB6A"/>
            <ellipse cx="0" cy="-74" rx="16" ry="16" fill="#81C784"/>
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
