"use client";

import { useState, useEffect } from "react";
import SpinWheel from "@/components/SpinWheel";

const START_DATE = new Date("2025-10-16");

function getDays() {
  const now = new Date();
  return Math.floor((now.getTime() - START_DATE.getTime()) / 86400000);
}

function getDaysToAnniversary() {
  const now = new Date();
  const next = new Date(START_DATE);
  next.setFullYear(now.getFullYear());
  if (next <= now) next.setFullYear(now.getFullYear() + 1);
  return Math.ceil((next.getTime() - now.getTime()) / 86400000);
}

export default function Home() {
  const [days, setDays] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    setDays(getDays());
    setDaysLeft(getDaysToAnniversary());
    const t = setInterval(() => {
      setDays(getDays());
      setDaysLeft(getDaysToAnniversary());
    }, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-pink-50 flex flex-col items-center px-4 py-12 gap-8">
      <div className="text-center">
        <p className="text-pink-300 text-sm tracking-widest mb-2">🦊 16 ต.ค. 2568</p>
        <p className="text-8xl font-bold text-pink-500">{days}</p>
        <p className="text-pink-400 mt-2 text-lg">วันที่อยู่ด้วยกัน</p>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 px-8 py-5 text-center w-full max-w-xs">
        <p className="text-gray-400 text-sm mb-1">ครบรอบปีถัดไป</p>
        {daysLeft === 0 ? (
          <p className="text-2xl font-semibold text-pink-500">🎉 วันนี้เลย!</p>
        ) : (
          <p className="text-2xl font-semibold text-gray-700">
            อีก <span className="text-pink-500">{daysLeft}</span> วัน
          </p>
        )}
      </div>

      <SpinWheel />
    </main>
  );
}
