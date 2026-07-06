"use client";

import { useEffect, useState } from "react";

const START_DATE = new Date("2025-10-16");

function getStats() {
  const now = new Date();
  const days = Math.floor((now.getTime() - START_DATE.getTime()) / 86400000);
  const next = new Date(START_DATE);
  next.setFullYear(now.getFullYear());
  if (next <= now) next.setFullYear(now.getFullYear() + 1);
  const daysLeft = Math.ceil((next.getTime() - now.getTime()) / 86400000);
  const years = Math.floor(days / 365);
  return { days, daysLeft, years };
}

export default function Anniversary() {
  const [stats, setStats] = useState(getStats);

  useEffect(() => {
    const t = setInterval(() => setStats(getStats()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10 bg-pink-50">
      <div className="text-6xl">🦊</div>

      <div className="text-center">
        <p className="text-pink-300 text-sm tracking-widest mb-1">เริ่มต้นวันที่ 16 ต.ค. 2568</p>
        <p className="text-8xl font-bold text-pink-500">{stats.days}</p>
        <p className="text-pink-400 text-lg mt-1">วันที่อยู่ด้วยกัน</p>
      </div>

      <div className="w-full max-w-xs grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-pink-100 p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">ครบรอบถัดไป</p>
          {stats.daysLeft === 0 ? (
            <p className="text-xl font-bold text-pink-500">🎉 วันนี้!</p>
          ) : (
            <>
              <p className="text-3xl font-bold text-pink-500">{stats.daysLeft}</p>
              <p className="text-gray-400 text-xs">วัน</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-pink-100 p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">อยู่ด้วยกันมา</p>
          <p className="text-3xl font-bold text-pink-500">{stats.years > 0 ? stats.years : "<1"}</p>
          <p className="text-gray-400 text-xs">ปี</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 px-6 py-4 w-full max-w-xs text-center">
        <p className="text-gray-400 text-xs mb-2">ในเวลา {stats.days} วัน...</p>
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <p>😴 นอนหลับไปประมาณ <span className="text-pink-500 font-semibold">{(stats.days * 8).toLocaleString()}</span> ชม.</p>
          <p>🍚 กินข้าวด้วยกันราว <span className="text-pink-500 font-semibold">{(stats.days * 2).toLocaleString()}</span> มื้อ</p>
          <p>❤️ บอกรักกันไปแล้ว <span className="text-pink-500 font-semibold">∞</span> ครั้ง</p>
        </div>
      </div>
    </div>
  );
}
