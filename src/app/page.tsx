"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HomeScene from "@/components/HomeScene";
import SpinWheel from "@/components/SpinWheel";
import Anniversary from "@/components/Anniversary";

type Tab = "home" | "spin" | "us";

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [tabKey, setTabKey] = useState(0);
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

  function switchTab(t: Tab) {
    if (t === tab) return;
    setTab(t);
    setTabKey(k => k + 1);
  }

  const NAV: { id: Tab; icon: string; label: string }[] = [
    { id: "home", icon: "🏠", label: "บ้าน" },
    { id: "spin", icon: "🎡", label: "กินอะไร" },
    { id: "us",   icon: "🐰", label: "เรา" },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative" style={{ background: "var(--teal-light)" }}>

      {/* Player modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
          <div className="tab-enter bg-white rounded-3xl px-6 py-8 mx-5 text-center shadow-2xl w-full max-w-sm">
            <Image src="/logo.png" alt="Foxy" width={68} height={68} className="mx-auto mb-3 rounded-2xl shadow-sm" />
            <h2 className="text-xl font-bold text-gray-700 mb-1">สวัสดี!</h2>
            <p className="text-sm mb-6" style={{ color: "var(--teal)" }}>คุณคือใคร?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => choosePlayer("หมาน้อย")}
                className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-4 px-2 transition-all active:scale-95"
                style={{ border: "2.5px solid var(--teal)", background: "var(--teal-light)" }}
              >
                <Image src="/beagle.png" alt="หมาน้อย" width={88} height={88} className="object-contain drop-shadow-sm" />
                <span className="text-sm font-bold" style={{ color: "var(--teal-dark)" }}>หมาน้อย</span>
                <span className="text-xs" style={{ color: "var(--teal)" }}>บีเกิล</span>
              </button>
              <button
                type="button"
                onClick={() => choosePlayer("หมาแก่")}
                className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-4 px-2 transition-all active:scale-95"
                style={{ border: "2.5px solid var(--beige)", background: "var(--beige-light)" }}
              >
                <Image src="/golden.png" alt="หมาแก่" width={88} height={88} className="object-contain drop-shadow-sm" />
                <span className="text-sm font-bold" style={{ color: "#9A7050" }}>หมาแก่</span>
                <span className="text-xs" style={{ color: "var(--beige)" }}>โกลเด้น</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3">
        <Image src="/logo.png" alt="Foxy" width={34} height={34} className="rounded-xl shadow-sm" />
        <span className="font-bold text-lg tracking-tight" style={{ color: "var(--teal-dark)" }}>Foxy</span>
        {player && (
          <button
            onClick={() => { localStorage.removeItem("foxy_player"); setPlayer(""); setShowPlayerModal(true); }}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all active:scale-95"
            style={{ background: "var(--teal)", color: "white" }}
          >
            {player === "หมาน้อย" ? "🐾" : "🦴"} {player}
          </button>
        )}
      </header>

      {/* Content */}
      <div key={tabKey} className="flex-1 flex flex-col overflow-hidden tab-enter">
        {tab === "home" && player && <HomeScene player={player} />}
        {tab === "spin" && (
          <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col items-center gap-4">
            <SpinWheel />
          </div>
        )}
        {tab === "us" && <Anniversary />}
      </div>

      {/* Bottom nav */}
      <nav className="bg-white px-2 pb-safe" style={{ borderTop: "1px solid var(--teal-mid)" }}>
        <div className="flex">
          {NAV.map(({ id, icon, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className="flex-1 flex flex-col items-center gap-0.5 pt-2 pb-3 relative transition-all"
                style={{ color: active ? "var(--teal-dark)" : "#B0C4C3" }}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-all"
                    style={{ width: 32, height: 3, background: "var(--teal)", borderRadius: "0 0 4px 4px" }}
                  />
                )}
                <span className="text-xl leading-none" style={{ transform: active ? "scale(1.15)" : "scale(1)", transition: "transform 0.2s" }}>{icon}</span>
                <span className="text-xs font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
