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

// happiness ลดต่อเนื่อง: อิ่ม 12 ชม.แรก แล้วลด 20/วัน (~0.83/ชม) นับจาก feed ครั้งล่าสุด
function calcHappiness(state: GameState) {
  const GRACE_H = 12, DECAY_PER_DAY = 20;
  const hungryHours = Math.max(0, hoursSince(state.fed_at_1) - GRACE_H);
  const decay = hungryHours * (DECAY_PER_DAY / 24);
  return Math.round(Math.max(0, Math.min(100, state.dog_happiness - decay)));
}

export default function HomeScene({ player }: { player: string }) {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [fx, setFx] = useState<"" | "feed" | "play">("");
  const [, setTick] = useState(0);

  useEffect(() => {
    fetchState();
    const sub = getSupabase()
      .channel("game")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_state" }, (p) => {
        setState(p.new as GameState);
      })
      .subscribe();
    const timer = setInterval(() => setTick(t => t + 1), 60_000); // re-render ให้ happiness ลดเห็นทุกนาที
    return () => { getSupabase().removeChannel(sub); clearInterval(timer); };
  }, []);

  async function fetchState() {
    const { data } = await getSupabase().from("game_state").select("*").eq("id", 1).single();
    setState(data);
    setLoading(false);
  }

  async function doFeed() {
    if (!state) return;
    triggerFx("feed");
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
    if (!state) return;
    triggerFx("play");
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

  function triggerFx(kind: "feed" | "play") {
    setFx(kind);
    setTimeout(() => setFx(""), 1200);
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

  if (!state) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-2xl">⚠️</p>
      <p className="text-sm font-bold text-red-500">ไม่สามารถโหลดข้อมูลได้</p>
      <button onClick={fetchState} className="mt-2 px-4 py-2 rounded-xl text-white text-sm" style={{background:"var(--teal)"}}>ลองใหม่</button>
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

          {/* ===== TREE (decoration, back-left) ===== */}
          <g className="tree-sway" style={{ transformOrigin: "48px 250px" }}>
            <rect x="42" y="190" width="14" height="60" rx="7" fill="#9B7240"/>
            <ellipse cx="48" cy="176" rx="36" ry="34" fill="#43A047"/>
            <ellipse cx="48" cy="158" rx="28" ry="26" fill="#4CAF50"/>
            <ellipse cx="48" cy="142" rx="20" ry="18" fill="#66BB6A"/>
            <ellipse cx="48" cy="130" rx="12" ry="12" fill="#81C784"/>
          </g>

          {/* ===== DOGHOUSE (back-right) ===== */}
          <g>
            <ellipse cx="330" cy="260" rx="52" ry="8" fill="#000" opacity="0.12"/>
            {/* body */}
            <rect x="292" y="200" width="76" height="60" rx="6" fill="#E08A5B"/>
            <rect x="292" y="200" width="76" height="60" rx="6" fill="none" stroke="#B96A3F" strokeWidth="2.5"/>
            {/* roof */}
            <polygon points="330,168 282,208 378,208" fill="#C25B3A"/>
            <polygon points="330,168 282,208 378,208" fill="none" stroke="#9E4529" strokeWidth="2.5"/>
            {/* arched door */}
            <path d="M314,260 L314,232 A16,16 0 0,1 346,232 L346,260 Z" fill="#7A4A32"/>
            {/* bone sign */}
            <text x="330" y="196" textAnchor="middle" fontSize="14">🦴</text>
          </g>

          {/* ===== TOYS (fill empty ground) ===== */}
          {/* ball bottom-left */}
          <g className="dog-bob" style={{ transformOrigin: "44px 508px", animationDelay: "0.8s" }}>
            <circle cx="44" cy="506" r="17" fill="#FF6B6B"/>
            <path d="M28,506 Q44,494 60,506" stroke="white" strokeWidth="2.5" fill="none"/>
            <path d="M28,506 Q44,518 60,506" stroke="white" strokeWidth="2.5" fill="none"/>
            <ellipse cx="44" cy="526" rx="15" ry="4" fill="#000" opacity="0.1"/>
          </g>
          {/* bone bottom-right */}
          <text x="350" y="518" textAnchor="middle" fontSize="26" transform="rotate(20,350,518)">🦴</text>

          {/* ===== DOGS (center, large) ===== */}
          <g className={fx ? "dog-jump" : "dog-bob"} style={{ mixBlendMode: "multiply" }}>
            <image href="/beagle.png" x="60" y="300" width="150" height="150" preserveAspectRatio="xMidYMid meet"/>
          </g>
          <g className={fx ? "dog-jump" : "dog-bob"} style={{ mixBlendMode: "multiply", animationDelay: "0.4s" }}>
            <image href="/golden.png" x="200" y="290" width="150" height="150" preserveAspectRatio="xMidYMid meet"/>
          </g>
          {/* floating fx emoji */}
          {fx === "feed" && [130, 195, 260].map((x, i) => (
            <text key={x} className="float-up" style={{ animationDelay: `${i * 0.15}s` }}
              x={x} y="330" textAnchor="middle" fontSize="26">{i === 1 ? "🦴" : "❤️"}</text>
          ))}
          {fx === "play" && [130, 195, 260].map((x, i) => (
            <text key={x} className="float-up" style={{ animationDelay: `${i * 0.15}s` }}
              x={x} y="330" textAnchor="middle" fontSize="24">✨</text>
          ))}
          {!dogHappy && !fx && <text x="195" y="285" textAnchor="middle" fontSize="22">😢</text>}
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
