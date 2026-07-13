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

      {/* Scene — portrait viewBox 390×560 */}
      <div className="relative" style={{ flex: 1, minHeight: 0 }}>
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

          {/* ===== HOUSE ===== */}
          <g transform="translate(130,254)">
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
          {[[80,432,"#FF9ECA"],[95,440,"#C39BD3"],[355,434,"#FFB347"],[370,442,"#FF9ECA"]].map(([x,y,c],i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <rect x="-1.5" y="-24" width="3" height="24" rx="2" fill="#4CAF50"/>
              <circle cx="0" cy="-28" r="8" fill={c as string}/>
              <circle cx="0" cy="-28" r="4" fill="#FFE566"/>
            </g>
          ))}

          {/* ===== DOGS (beagle left, golden right) ===== */}
          <g className="dog-bob" style={{ mixBlendMode: "multiply" }}>
            <image href="/beagle.png" x="248" y="380" width="90" height="90" preserveAspectRatio="xMidYMid meet"/>
          </g>
          <g className="dog-bob" style={{ mixBlendMode: "multiply", animationDelay: "0.4s" }}>
            <image href="/golden.png" x="310" y="375" width="90" height="90" preserveAspectRatio="xMidYMid meet"/>
          </g>
          {!dogHappy && <text x="330" y="372" textAnchor="middle" fontSize="18">😢</text>}
          {/* happiness label */}
          <rect x="256" y="468" width="90" height="22" rx="11" fill="white" opacity="0.92"/>
          <text x="301" y="483" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fill="#C4996A" fontWeight="bold">🐾 {state?.dog_happiness ?? 100}%</text>
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
