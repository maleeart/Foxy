"use client";

import { useEffect, useState } from "react";
import { getSupabase, GameState } from "@/lib/supabase";

const TODAY = new Date().toISOString().slice(0, 10);

export default function HomeScene({ player }: { player: string }) {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

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

  async function doAction(action: "water" | "feed") {
    if (!state) return;
    const isWater = action === "water";
    const doneToday = isWater ? state.watered_at === TODAY : state.fed_at === TODAY;
    if (doneToday) { showToast("ทำไปแล้ววันนี้ 😊"); return; }
    const update = isWater
      ? { watered_by: player, watered_at: TODAY, tree_level: Math.min(state.tree_level + 1, 10) }
      : { fed_by: player, fed_at: TODAY, dog_happiness: Math.min(state.dog_happiness + 10, 100) };
    const { data } = await getSupabase().from("game_state").update(update).eq("id", 1).select().single();
    if (data) setState(data);
    showToast(isWater ? "🌳 รดน้ำต้นไม้แล้ว!" : "🐾 ให้อาหารหมาแล้ว!");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  const wateredToday = state?.watered_at === TODAY;
  const fedToday = state?.fed_at === TODAY;
  const treeScale = 0.7 + (state?.tree_level ?? 1) * 0.03;
  const dogHappy = (state?.dog_happiness ?? 100) >= 60;
  const lv = state?.tree_level ?? 1;

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "var(--teal)" }}>
      <div className="text-3xl animate-spin">🌀</div>
      <p className="text-sm font-medium">กำลังโหลด...</p>
    </div>
  );

  return (
    <div className="flex flex-col relative select-none" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      {toast && (
        <div className="toast-anim absolute top-4 left-1/2 z-20 bg-white rounded-full px-5 py-2.5 text-sm font-bold shadow-lg"
          style={{ color: "var(--teal-dark)", border: "1.5px solid var(--teal-mid)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Scene */}
      <div className="relative" style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%", position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#87CEEB"/>
              <stop offset="100%" stopColor="#D4EEFF"/>
            </linearGradient>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7BC67E"/>
              <stop offset="100%" stopColor="#5A9E5E"/>
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="680" height="420" fill="url(#skyGrad)"/>

          {/* Sun glow */}
          <circle cx="594" cy="60" r="50" fill="#FFE566" opacity="0.15"/>
          <circle cx="594" cy="60" r="34" fill="#FFD84D" opacity="0.9"/>
          <circle cx="587" cy="55" r="4" fill="#E6B800"/>
          <circle cx="601" cy="55" r="4" fill="#E6B800"/>
          <path d="M587,64 Q594,70 601,64" stroke="#E6B800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

          {/* Clouds animated */}
          <g className="cloud-1" opacity="0.95">
            <ellipse cx="130" cy="74" rx="46" ry="24" fill="white"/>
            <ellipse cx="104" cy="82" rx="30" ry="20" fill="white"/>
            <ellipse cx="160" cy="82" rx="32" ry="18" fill="white"/>
          </g>
          <g className="cloud-2" opacity="0.85">
            <ellipse cx="320" cy="52" rx="38" ry="20" fill="white"/>
            <ellipse cx="295" cy="60" rx="25" ry="16" fill="white"/>
            <ellipse cx="346" cy="60" rx="27" ry="15" fill="white"/>
          </g>

          {/* Ground */}
          <rect x="0" y="342" width="680" height="78" fill="url(#groundGrad)"/>
          <ellipse cx="340" cy="344" rx="344" ry="18" fill="#6DBF67"/>
          {/* Path */}
          <ellipse cx="340" cy="420" rx="40" ry="80" fill="#D4A96A" opacity="0.55"/>

          {/* Grass tufts */}
          {[80,170,260,430,520,610].map((x,i) => (
            <g key={i} transform={`translate(${x},342)`}>
              <path d="M0,0 Q-4,-10 -2,-18" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M0,0 Q0,-12 0,-20" stroke="#5CBF60" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M0,0 Q4,-10 2,-18" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </g>
          ))}

          {/* ===== TREE ===== */}
          <g transform={`translate(118,${218 - lv * 3})`}>
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

          {/* ===== HOUSE ===== */}
          <g transform="translate(285,148)">
            {/* shadow */}
            <ellipse cx="60" cy="202" rx="78" ry="10" fill="#4A9A44" opacity="0.25"/>
            {/* body */}
            <rect x="0" y="95" width="120" height="107" rx="8" fill="#FFF5DC"/>
            <rect x="0" y="95" width="120" height="107" rx="8" fill="none" stroke="#EACC6A" strokeWidth="3"/>
            {/* roof */}
            <polygon points="60,2 -18,95 138,95" fill="#FF7070"/>
            <polygon points="60,2 -18,95 138,95" fill="none" stroke="#E05555" strokeWidth="3"/>
            {/* chimney */}
            <rect x="86" y="-30" width="22" height="40" rx="5" fill="#CC5555"/>
            <rect x="82" y="-36" width="30" height="10" rx="5" fill="#CC5555"/>
            <circle cx="97" cy="-50" r="8" fill="#DDD" opacity="0.6" className="smoke-1"/>
            <circle cx="93" cy="-68" r="6" fill="#DDD" opacity="0.4" className="smoke-2"/>
            {/* windows */}
            <rect x="10" y="114" width="36" height="32" rx="7" fill="#C5E8F5"/>
            <rect x="10" y="114" width="36" height="32" rx="7" fill="none" stroke="#EACC6A" strokeWidth="2"/>
            <line x1="28" y1="114" x2="28" y2="146" stroke="#EACC6A" strokeWidth="1.5"/>
            <line x1="10" y1="130" x2="46" y2="130" stroke="#EACC6A" strokeWidth="1.5"/>
            {/* curtain left */}
            <path d="M10,114 Q18,128 10,146" fill="#FFB3CC" opacity="0.45"/>
            <path d="M46,114 Q38,128 46,146" fill="#FFB3CC" opacity="0.45"/>
            <rect x="74" y="114" width="36" height="32" rx="7" fill="#C5E8F5"/>
            <rect x="74" y="114" width="36" height="32" rx="7" fill="none" stroke="#EACC6A" strokeWidth="2"/>
            <line x1="92" y1="114" x2="92" y2="146" stroke="#EACC6A" strokeWidth="1.5"/>
            <line x1="74" y1="130" x2="110" y2="130" stroke="#EACC6A" strokeWidth="1.5"/>
            <path d="M74,114 Q82,128 74,146" fill="#FFB3CC" opacity="0.45"/>
            <path d="M110,114 Q102,128 110,146" fill="#FFB3CC" opacity="0.45"/>
            {/* door */}
            <rect x="42" y="156" width="36" height="46" rx="18" fill="#C8916B"/>
            <rect x="42" y="156" width="36" height="46" rx="18" fill="none" stroke="#A07050" strokeWidth="2.5"/>
            <circle cx="74" cy="181" r="4" fill="#FFD700"/>
            {/* label */}
            <rect x="-8" y="208" width="136" height="24" rx="12" fill="white" opacity="0.92"/>
            <text x="60" y="224" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#E07070" fontWeight="bold">🏠 บ้านของเรา</text>
          </g>

          {/* Flowers */}
          {[[236,318,"#FF9ECA"],[252,326,"#C39BD3"],[460,320,"#FFB347"],[472,328,"#FF9ECA"]].map(([x,y,c],i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <rect x="-1.5" y="-24" width="3" height="24" rx="2" fill="#4CAF50"/>
              <circle cx="0" cy="-28" r="8" fill={c as string}/>
              <circle cx="0" cy="-28" r="4" fill="#FFE566"/>
            </g>
          ))}

          {/* ===== DOG ===== */}
          <g transform="translate(496,308)" className="dog-bob">
            {/* body */}
            <ellipse cx="0" cy="0" rx="38" ry="27" fill="#E8C49A"/>
            <ellipse cx="0" cy="0" rx="38" ry="27" fill="none" stroke="#C4996A" strokeWidth="2"/>
            <ellipse cx="5" cy="7" rx="20" ry="13" fill="#FFF5E6" opacity="0.65"/>
            {/* tail animated */}
            <g className="tail-wag" style={{ transformOrigin: "-30px -10px" }}>
              <path d="M-30,-10 Q-54,-32 -44,-52" stroke="#E8C49A" strokeWidth="13" fill="none" strokeLinecap="round"/>
              <path d="M-30,-10 Q-54,-32 -44,-52" stroke="#C4996A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </g>
            {/* legs */}
            <rect x="-25" y="19" width="14" height="22" rx="7" fill="#D4A870"/>
            <rect x="-8" y="21" width="14" height="20" rx="7" fill="#D4A870"/>
            <rect x="9" y="21" width="14" height="20" rx="7" fill="#D4A870"/>
            {/* head */}
            <circle cx="42" cy="-17" r="29" fill="#E8C49A"/>
            <circle cx="42" cy="-17" r="29" fill="none" stroke="#C4996A" strokeWidth="2"/>
            {/* ears */}
            <ellipse cx="24" cy="-37" rx="10" ry="16" fill="#C4996A" transform="rotate(-20,24,-37)"/>
            <ellipse cx="60" cy="-37" rx="10" ry="16" fill="#C4996A" transform="rotate(20,60,-37)"/>
            {/* eyes */}
            <circle cx="34" cy="-21" r="5.5" fill="white"/>
            <circle cx="50" cy="-21" r="5.5" fill="white"/>
            <circle cx="35" cy="-20" r="3.5" fill="#2C1A0A"/>
            <circle cx="51" cy="-20" r="3.5" fill="#2C1A0A"/>
            <circle cx="36" cy="-21.5" r="1.3" fill="white"/>
            <circle cx="52" cy="-21.5" r="1.3" fill="white"/>
            {/* nose */}
            <ellipse cx="42" cy="-8" rx="6.5" ry="4.5" fill="#2C1A0A"/>
            <ellipse cx="40" cy="-9.5" rx="2.2" ry="1.6" fill="white" opacity="0.45"/>
            {/* mouth */}
            <path d="M36,0 Q42,6 48,0" stroke="#C4996A" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* cheeks */}
            <circle cx="27" cy="-8" r="8" fill="#FFB3A0" opacity="0.38"/>
            <circle cx="57" cy="-8" r="8" fill="#FFB3A0" opacity="0.38"/>
            {!dogHappy && <text x="42" y="-54" textAnchor="middle" fontSize="18">😢</text>}
            {/* label */}
            <rect x="-2" y="50" width="90" height="24" rx="12" fill="white" opacity="0.92"/>
            <text x="43" y="66" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#C4996A" fontWeight="bold">🐾 {state?.dog_happiness ?? 100}%</text>
          </g>
        </svg>
      </div>

      {/* Action buttons */}
      <div className="bg-white px-4 py-4 flex gap-3" style={{ borderTop: "1.5px solid var(--teal-mid)" }}>
        <button
          onClick={() => doAction("water")}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={wateredToday
            ? { background: "var(--teal-light)", color: "var(--teal)", cursor: "default", border: "1.5px solid var(--teal-mid)" }
            : { background: "var(--teal)", color: "white", boxShadow: "0 4px 12px rgba(77,197,190,0.35)" }}
        >
          {wateredToday ? "✅ รดน้ำแล้ว" : "💧 รดน้ำต้นไม้"}
          {state?.watered_by && wateredToday && (
            <span className="text-xs block font-normal mt-0.5" style={{ color: "var(--teal)" }}>โดย {state.watered_by}</span>
          )}
        </button>
        <button
          onClick={() => doAction("feed")}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={fedToday
            ? { background: "var(--beige-light)", color: "var(--beige)", cursor: "default", border: "1.5px solid #E8D5B8" }
            : { background: "var(--beige)", color: "white", boxShadow: "0 4px 12px rgba(200,168,130,0.35)" }}
        >
          {fedToday ? "✅ ให้อาหารแล้ว" : "🦴 ให้อาหารหมา"}
          {state?.fed_by && fedToday && (
            <span className="text-xs block font-normal mt-0.5" style={{ color: "var(--beige)" }}>โดย {state.fed_by}</span>
          )}
        </button>
      </div>
    </div>
  );
}
