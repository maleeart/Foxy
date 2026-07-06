"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HomeScene from "@/components/HomeScene";
import SpinWheel from "@/components/SpinWheel";
import Anniversary from "@/components/Anniversary";

type Tab = "home" | "spin" | "us";

function _BeagleSVG_unused() {
  return (
    <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <ellipse cx="40" cy="56" rx="22" ry="16" fill="#C8A070"/>
      <ellipse cx="40" cy="58" rx="14" ry="10" fill="#F5E8D0"/>
      {/* legs */}
      <rect x="22" y="66" width="9" height="12" rx="4" fill="#C8A070"/>
      <rect x="34" y="66" width="9" height="12" rx="4" fill="#C8A070"/>
      <rect x="46" y="66" width="9" height="12" rx="4" fill="#C8A070"/>
      {/* tail */}
      <path d="M62,52 Q72,44 68,36" stroke="#C8A070" strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* head */}
      <circle cx="40" cy="32" r="20" fill="#C8A070"/>
      {/* face white patch */}
      <ellipse cx="40" cy="36" rx="12" ry="10" fill="#F5E8D0"/>
      {/* ears - long floppy beagle */}
      <ellipse cx="20" cy="34" rx="8" ry="16" fill="#7B4A1E" transform="rotate(-10,20,34)"/>
      <ellipse cx="60" cy="34" rx="8" ry="16" fill="#7B4A1E" transform="rotate(10,60,34)"/>
      {/* black saddle on back */}
      <ellipse cx="40" cy="22" rx="14" ry="10" fill="#3A2010"/>
      {/* eyes */}
      <circle cx="33" cy="30" r="4.5" fill="white"/>
      <circle cx="47" cy="30" r="4.5" fill="white"/>
      <circle cx="34" cy="30" r="3" fill="#2C1A0E"/>
      <circle cx="48" cy="30" r="3" fill="#2C1A0E"/>
      <circle cx="34.8" cy="29" r="1" fill="white"/>
      <circle cx="48.8" cy="29" r="1" fill="white"/>
      {/* nose */}
      <ellipse cx="40" cy="38" rx="5" ry="3.5" fill="#2C1A0E"/>
      <ellipse cx="39" cy="37" rx="1.5" ry="1" fill="white" opacity="0.5"/>
      {/* mouth */}
      <path d="M36,42 Q40,46 44,42" stroke="#A07850" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* cheeks */}
      <circle cx="28" cy="36" r="5" fill="#E8907A" opacity="0.35"/>
      <circle cx="52" cy="36" r="5" fill="#E8907A" opacity="0.35"/>
    </svg>
  );
}

function _GoldenSVG_unused() {
  return (
    <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
      {/* body - chubby */}
      <ellipse cx="40" cy="58" rx="26" ry="18" fill="#D4953A"/>
      <ellipse cx="40" cy="60" rx="18" ry="12" fill="#E8C07A"/>
      {/* fluffy chest */}
      <ellipse cx="40" cy="54" rx="12" ry="8" fill="#EDD090"/>
      {/* legs - stubby */}
      <rect x="20" y="68" width="10" height="11" rx="5" fill="#C4852A"/>
      <rect x="32" y="70" width="10" height="10" rx="5" fill="#C4852A"/>
      <rect x="44" y="70" width="10" height="10" rx="5" fill="#C4852A"/>
      <rect x="54" y="68" width="10" height="11" rx="5" fill="#C4852A"/>
      {/* tail droopy */}
      <path d="M64,54 Q76,56 72,66" stroke="#D4953A" strokeWidth="8" fill="none" strokeLinecap="round"/>
      {/* head */}
      <circle cx="40" cy="30" r="22" fill="#D4953A"/>
      {/* fluffy face */}
      <ellipse cx="40" cy="34" rx="15" ry="13" fill="#E8C07A"/>
      {/* droopy jowls */}
      <ellipse cx="30" cy="38" rx="8" ry="6" fill="#C4852A"/>
      <ellipse cx="50" cy="38" rx="8" ry="6" fill="#C4852A"/>
      {/* ears - floppy golden */}
      <ellipse cx="18" cy="32" rx="9" ry="18" fill="#B8741A" transform="rotate(-15,18,32)"/>
      <ellipse cx="62" cy="32" rx="9" ry="18" fill="#B8741A" transform="rotate(15,62,32)"/>
      {/* wrinkle lines */}
      <path d="M34,24 Q40,22 46,24" stroke="#C4852A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* eyes - droopy */}
      <circle cx="33" cy="28" r="5" fill="white"/>
      <circle cx="47" cy="28" r="5" fill="white"/>
      <circle cx="33" cy="29" r="3.5" fill="#2C1A0E"/>
      <circle cx="47" cy="29" r="3.5" fill="#2C1A0E"/>
      <circle cx="33.8" cy="28" r="1.2" fill="white"/>
      <circle cx="47.8" cy="28" r="1.2" fill="white"/>
      {/* droopy eyelids */}
      <path d="M28,26 Q33,24 38,26" stroke="#C4852A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M42,26 Q47,24 52,26" stroke="#C4852A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* nose big */}
      <ellipse cx="40" cy="36" rx="6" ry="4" fill="#2C1A0E"/>
      <ellipse cx="38.5" cy="35" rx="2" ry="1.5" fill="white" opacity="0.45"/>
      {/* mouth */}
      <path d="M35,41 Q40,46 45,41" stroke="#A07030" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* cheeks rosy */}
      <circle cx="26" cy="34" r="6" fill="#E8907A" opacity="0.3"/>
      <circle cx="54" cy="34" r="6" fill="#E8907A" opacity="0.3"/>
    </svg>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [player, setPlayer] = useState<string>("");
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("foxy_player");
    if (saved) setPlayer(saved);
    else setShowPlayerModal(true);
  }, []);

  function choosePlayer(name: string) {
    localStorage.setItem("foxy_player", name);
    setPlayer(name);
    setShowPlayerModal(false);
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative" style={{ background: "var(--teal-light)" }}>
      {/* Player modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white rounded-3xl px-6 py-8 mx-6 text-center shadow-xl w-full max-w-sm">
            <Image src="/logo.png" alt="Foxy" width={72} height={72} className="mx-auto mb-3 rounded-2xl" />
            <h2 className="text-xl font-bold text-gray-700 mb-1">สวัสดี!</h2>
            <p className="text-gray-400 text-sm mb-6">คุณคือใคร?</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => choosePlayer("หมาน้อย")}
                className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-4 px-2 border-2 transition-all active:scale-95"
                style={{ borderColor: "var(--teal)", background: "var(--teal-light)" }}
              >
                <Image src="/beagle.png" alt="หมาน้อย" width={90} height={90} className="object-contain" />
                <span className="text-sm font-bold" style={{ color: "var(--teal-dark)" }}>หมาน้อย</span>
              </button>
              <button
                type="button"
                onClick={() => choosePlayer("หมาแก่")}
                className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-4 px-2 border-2 transition-all active:scale-95"
                style={{ borderColor: "var(--beige)", background: "#FFF8F0" }}
              >
                <Image src="/golden.png" alt="หมาแก่" width={90} height={90} className="object-contain" />
                <span className="text-sm font-bold" style={{ color: "#9A7050" }}>หมาแก่</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Image src="/logo.png" alt="Foxy" width={36} height={36} className="rounded-xl" />
        <span className="font-bold text-lg" style={{ color: "var(--teal-dark)" }}>Foxy</span>
        {player && (
          <span
            className="ml-auto text-xs px-3 py-1 rounded-full text-white"
            style={{ background: "var(--teal)" }}
          >
            {player}
          </span>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === "home" && player && <HomeScene player={player} />}
        {tab === "spin" && (
          <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col items-center">
            <SpinWheel />
          </div>
        )}
        {tab === "us" && <Anniversary />}
      </div>

      {/* Bottom nav */}
      <nav className="bg-white border-t flex" style={{ borderColor: "#E6F8F7" }}>
        {(["home", "spin", "us"] as Tab[]).map((t) => {
          const icons: Record<Tab, string> = { home: "🏠", spin: "🎡", us: "🐰" };
          const labels: Record<Tab, string> = { home: "บ้าน", spin: "กินอะไร", us: "เรา" };
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors"
              style={{ color: active ? "var(--teal)" : "#CBD5E1" }}
            >
              <span className="text-xl">{icons[t]}</span>
              <span className="text-xs font-medium">{labels[t]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
