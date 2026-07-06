"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HomeScene from "@/components/HomeScene";
import SpinWheel from "@/components/SpinWheel";
import Anniversary from "@/components/Anniversary";

type Tab = "home" | "spin" | "us";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-3xl p-8 mx-6 text-center shadow-lg">
            <Image src="/logo.png" alt="Foxy" width={80} height={80} className="mx-auto mb-4 rounded-2xl" />
            <h2 className="text-xl font-bold text-gray-700 mb-1">สวัสดี!</h2>
            <p className="text-gray-400 text-sm mb-6">คุณคือใคร?</p>
            <div className="flex gap-3">
              <button
                onClick={() => choosePlayer("เรา")}
                className="flex-1 text-white font-semibold py-3 rounded-2xl active:scale-95 transition-all"
                style={{ background: "var(--teal)" }}
              >
                เรา 🐰
              </button>
              <button
                onClick={() => choosePlayer("แฟน")}
                className="flex-1 text-white font-semibold py-3 rounded-2xl active:scale-95 transition-all"
                style={{ background: "var(--beige)" }}
              >
                แฟน 🤍
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
