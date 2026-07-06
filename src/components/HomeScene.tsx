"use client";

import { useEffect, useState } from "react";
import { supabase, GameState } from "@/lib/supabase";

const TODAY = new Date().toISOString().slice(0, 10);

export default function HomeScene({ player }: { player: string }) {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchState();
    const sub = supabase
      .channel("game")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_state" }, (p) => {
        setState(p.new as GameState);
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  async function fetchState() {
    const { data } = await supabase.from("game_state").select("*").eq("id", 1).single();
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

    const { data } = await supabase.from("game_state").update(update).eq("id", 1).select().single();
    if (data) setState(data);
    showToast(isWater ? "🌳 รดน้ำต้นไม้แล้ว!" : "🐾 ให้อาหารหมาแล้ว!");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const wateredToday = state?.watered_at === TODAY;
  const fedToday = state?.fed_at === TODAY;
  const treeScale = 0.7 + (state?.tree_level ?? 1) * 0.03;
  const dogHappy = (state?.dog_happiness ?? 100) >= 60;

  if (loading) return <div className="flex-1 flex items-center justify-center text-lg" style={{ color: "var(--teal)" }}>กำลังโหลด...</div>;

  return (
    <div className="flex flex-col flex-1 relative select-none">
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white rounded-full px-5 py-2 text-sm font-semibold shadow-sm animate-bounce" style={{ color: "var(--teal-dark)", border: "1px solid var(--teal-light)" }}>
          {toast}
        </div>
      )}

      {/* Scene SVG */}
      <div className="flex-1 relative overflow-hidden">
        <svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <radialGradient id="sky" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#B8E4FF"/>
              <stop offset="100%" stopColor="#E8F7FF"/>
            </radialGradient>
          </defs>

          {/* Sky */}
          <rect width="680" height="420" fill="url(#sky)"/>

          {/* Sun */}
          <circle cx="580" cy="65" r="38" fill="#FFE566" opacity="0.3"/>
          <circle cx="580" cy="65" r="28" fill="#FFD84D"/>
          <circle cx="572" cy="61" r="3.5" fill="#E6B800"/>
          <circle cx="588" cy="61" r="3.5" fill="#E6B800"/>
          <path d="M572,71 Q580,77 588,71" stroke="#E6B800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

          {/* Clouds */}
          <g opacity="0.95">
            <ellipse cx="120" cy="72" rx="42" ry="22" fill="white"/>
            <ellipse cx="95" cy="80" rx="28" ry="18" fill="white"/>
            <ellipse cx="148" cy="80" rx="30" ry="16" fill="white"/>
          </g>
          <g opacity="0.9">
            <ellipse cx="310" cy="55" rx="34" ry="18" fill="white"/>
            <ellipse cx="288" cy="62" rx="22" ry="14" fill="white"/>
            <ellipse cx="333" cy="62" rx="24" ry="13" fill="white"/>
          </g>

          {/* Ground */}
          <rect x="0" y="340" width="680" height="80" fill="#6DBF67"/>
          <ellipse cx="340" cy="342" rx="340" ry="16" fill="#5BAF55"/>
          <path d="M310,420 Q320,355 340,340 Q360,355 370,420" fill="#D4A96A" opacity="0.7"/>

          {/* Tree */}
          <g transform={`translate(120,${220 - (state?.tree_level ?? 1) * 4})`} style={{ transformOrigin: "120px 340px" }}>
            <rect x="-10" y="80" width="20" height="60" rx="8" fill="#8B6234"/>
            <g style={{ transform: `scale(${treeScale})`, transformOrigin: "0px 80px" }}>
              <ellipse cx="0" cy="55" rx="55" ry="48" fill="#4CAF50"/>
              <ellipse cx="0" cy="30" rx="42" ry="38" fill="#5CBF60"/>
              <ellipse cx="0" cy="10" rx="30" ry="28" fill="#6DD96A"/>
              {(state?.tree_level ?? 1) >= 3 && <circle cx="-28" cy="48" r="8" fill="#FF6B6B"/>}
              {(state?.tree_level ?? 1) >= 5 && <circle cx="24" cy="42" r="7" fill="#FF8C42"/>}
              {(state?.tree_level ?? 1) >= 7 && <circle cx="8" cy="65" r="6" fill="#FFDD44"/>}
              <circle cx="-8" cy="38" r="3" fill="#2E7D32"/>
              <circle cx="8" cy="38" r="3" fill="#2E7D32"/>
              <path d="M-6,46 Q0,51 6,46" stroke="#2E7D32" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </g>
            <rect x="-44" y="148" width="88" height="22" rx="11" fill="white" opacity="0.9"/>
            <text x="0" y="163" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#5BAF55" fontWeight="bold">🌳 Lv.{state?.tree_level ?? 1}</text>
          </g>

          {/* House */}
          <g transform="translate(290,160)">
            <ellipse cx="55" cy="195" rx="75" ry="10" fill="#5BAF55" opacity="0.3"/>
            <rect x="0" y="90" width="110" height="105" rx="6" fill="#FFF0D0"/>
            <rect x="0" y="90" width="110" height="105" rx="6" fill="none" stroke="#E8C870" strokeWidth="3"/>
            <polygon points="55,-10 -14,90 124,90" fill="#FF7F7F"/>
            <polygon points="55,-10 -14,90 124,90" fill="none" stroke="#E86060" strokeWidth="3"/>
            <rect x="78" y="-32" width="20" height="38" rx="4" fill="#CC6666"/>
            <rect x="74" y="-36" width="28" height="8" rx="4" fill="#CC6666"/>
            <circle cx="88" cy="-52" r="7" fill="#DDD" opacity="0.6"/>
            <circle cx="84" cy="-66" r="5" fill="#DDD" opacity="0.4"/>
            <rect x="10" y="108" width="32" height="30" rx="6" fill="#AED6F1"/>
            <rect x="10" y="108" width="32" height="30" rx="6" fill="none" stroke="#E8C870" strokeWidth="2"/>
            <line x1="26" y1="108" x2="26" y2="138" stroke="#E8C870" strokeWidth="1.5"/>
            <line x1="10" y1="123" x2="42" y2="123" stroke="#E8C870" strokeWidth="1.5"/>
            <rect x="68" y="108" width="32" height="30" rx="6" fill="#AED6F1"/>
            <rect x="68" y="108" width="32" height="30" rx="6" fill="none" stroke="#E8C870" strokeWidth="2"/>
            <line x1="84" y1="108" x2="84" y2="138" stroke="#E8C870" strokeWidth="1.5"/>
            <line x1="68" y1="123" x2="100" y2="123" stroke="#E8C870" strokeWidth="1.5"/>
            <rect x="37" y="148" width="36" height="48" rx="18" fill="#C8916B"/>
            <rect x="37" y="148" width="36" height="48" rx="18" fill="none" stroke="#A0714E" strokeWidth="2"/>
            <circle cx="70" cy="174" r="3.5" fill="#FFD700"/>
            <rect x="-12" y="200" width="134" height="22" rx="11" fill="white" opacity="0.9"/>
            <text x="55" y="215" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#E87070" fontWeight="bold">🏠 บ้านของเรา</text>
          </g>

          {/* Flowers */}
          <g transform="translate(238,322)">
            <rect x="-1" y="-28" width="3" height="28" rx="2" fill="#4CAF50"/>
            <circle cx="0" cy="-32" r="9" fill="#FF9ECA"/>
            <circle cx="0" cy="-32" r="5" fill="#FFE566"/>
          </g>
          <g transform="translate(254,330)">
            <rect x="-1" y="-20" width="3" height="20" rx="2" fill="#4CAF50"/>
            <circle cx="0" cy="-24" r="7" fill="#C39BD3"/>
            <circle cx="0" cy="-24" r="3.5" fill="#FFE566"/>
          </g>
          <g transform="translate(458,324)">
            <rect x="-1" y="-26" width="3" height="26" rx="2" fill="#4CAF50"/>
            <circle cx="0" cy="-30" r="8" fill="#FFB347"/>
            <circle cx="0" cy="-30" r="4" fill="#FFE566"/>
          </g>

          {/* Dog - fixed on ground */}
          <g transform="translate(490,316)">
            <ellipse cx="0" cy="0" rx="36" ry="26" fill="#E8C49A"/>
            <ellipse cx="0" cy="0" rx="36" ry="26" fill="none" stroke="#C4996A" strokeWidth="2"/>
            <ellipse cx="4" cy="6" rx="18" ry="12" fill="#FFF5E6" opacity="0.6"/>
            <path d="M-30,-10 Q-52,-30 -42,-48" stroke="#E8C49A" strokeWidth="12" fill="none" strokeLinecap="round"/>
            <path d="M-30,-10 Q-52,-30 -42,-48" stroke="#C4996A" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <rect x="-24" y="18" width="13" height="20" rx="6" fill="#D4A870"/>
            <rect x="-8" y="18" width="13" height="20" rx="6" fill="#D4A870"/>
            <rect x="10" y="18" width="13" height="20" rx="6" fill="#D4A870"/>
            <circle cx="40" cy="-16" r="27" fill="#E8C49A"/>
            <circle cx="40" cy="-16" r="27" fill="none" stroke="#C4996A" strokeWidth="2"/>
            <ellipse cx="23" cy="-34" rx="9" ry="15" fill="#C4996A" transform="rotate(-20,23,-34)"/>
            <ellipse cx="57" cy="-34" rx="9" ry="15" fill="#C4996A" transform="rotate(20,57,-34)"/>
            <circle cx="33" cy="-20" r="4.5" fill="white"/>
            <circle cx="47" cy="-20" r="4.5" fill="white"/>
            <circle cx="34" cy="-19" r="3" fill="#333"/>
            <circle cx="48" cy="-19" r="3" fill="#333"/>
            <circle cx="35" cy="-20" r="1" fill="white"/>
            <circle cx="49" cy="-20" r="1" fill="white"/>
            <ellipse cx="40" cy="-7" rx="6" ry="4" fill="#333"/>
            <ellipse cx="38" cy="-8" rx="2" ry="1.5" fill="white" opacity="0.5"/>
            <path d="M34,1 Q40,7 46,1" stroke="#C4996A" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="26" cy="-6" r="7" fill="#FFB3A0" opacity="0.4"/>
            <circle cx="54" cy="-6" r="7" fill="#FFB3A0" opacity="0.4"/>
            {!dogHappy && <text x="40" y="-52" textAnchor="middle" fontSize="16">😢</text>}
            <rect x="-4" y="48" width="88" height="22" rx="11" fill="white" opacity="0.9"/>
            <text x="40" y="63" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="#C4996A" fontWeight="bold">🐾 {state?.dog_happiness ?? 100}%</text>
          </g>
        </svg>
      </div>

      {/* Action buttons */}
      <div className="bg-white px-4 py-3 flex gap-3" style={{ borderTop: "1px solid var(--teal-light)" }}>
        <button
          onClick={() => doAction("water")}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
          style={wateredToday
            ? { background: "var(--teal-light)", color: "var(--teal)", cursor: "default" }
            : { background: "var(--teal)", color: "white" }}
        >
          {wateredToday ? "✅ รดน้ำแล้ว" : "💧 รดน้ำต้นไม้"}
          {state?.watered_by && wateredToday && <span className="text-xs block font-normal">โดย {state.watered_by}</span>}
        </button>
        <button
          onClick={() => doAction("feed")}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
          style={fedToday
            ? { background: "#FFF5E6", color: "var(--beige)", cursor: "default" }
            : { background: "var(--beige)", color: "white" }}
        >
          {fedToday ? "✅ ให้อาหารแล้ว" : "🦴 ให้อาหารหมา"}
          {state?.fed_by && fedToday && <span className="text-xs block font-normal">โดย {state.fed_by}</span>}
        </button>
      </div>
    </div>
  );
}
