"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8" style={{ background: "var(--teal-light)" }}>
      <Image src="/logo.png" alt="Foxy" width={90} height={90} className="rounded-3xl shadow-sm" />

      <div className="text-center">
        <p className="text-sm tracking-widest mb-1" style={{ color: "var(--teal)" }}>🐰 16 ต.ค. 2568</p>
        <p className="text-8xl font-bold" style={{ color: "var(--teal-dark)" }}>{stats.days}</p>
        <p className="text-lg mt-1" style={{ color: "var(--teal)" }}>วันที่อยู่ด้วยกัน</p>
      </div>

      <div className="w-full max-w-xs grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: "#D0EFED" }}>
          <p className="text-gray-400 text-xs mb-1">ครบรอบถัดไป</p>
          {stats.daysLeft === 0 ? (
            <p className="text-xl font-bold" style={{ color: "var(--teal)" }}>🎉 วันนี้!</p>
          ) : (
            <>
              <p className="text-3xl font-bold" style={{ color: "var(--teal-dark)" }}>{stats.daysLeft}</p>
              <p className="text-gray-400 text-xs">วัน</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: "#D0EFED" }}>
          <p className="text-gray-400 text-xs mb-1">อยู่ด้วยกันมา</p>
          <p className="text-3xl font-bold" style={{ color: "var(--teal-dark)" }}>{stats.years > 0 ? stats.years : "<1"}</p>
          <p className="text-gray-400 text-xs">ปี</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border px-6 py-4 w-full max-w-xs text-center" style={{ borderColor: "#D0EFED" }}>
        <p className="text-gray-400 text-xs mb-2">ใน {stats.days} วันที่ผ่านมา...</p>
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <p>😴 นอนหลับราว <span className="font-semibold" style={{ color: "var(--teal-dark)" }}>{(stats.days * 8).toLocaleString()}</span> ชม.</p>
          <p>🍚 กินข้าวด้วยกันราว <span className="font-semibold" style={{ color: "var(--teal-dark)" }}>{(stats.days * 2).toLocaleString()}</span> มื้อ</p>
          <p>🐰 บอกรักกันไปแล้ว <span className="font-semibold" style={{ color: "var(--teal-dark)" }}>∞</span> ครั้ง</p>
        </div>
      </div>
    </div>
  );
}
