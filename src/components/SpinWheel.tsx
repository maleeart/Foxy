"use client";

import { useState, useRef } from "react";

const DEFAULT_ITEMS = ["ชาบู 🍲", "พิซซ่า 🍕", "ส้มตำ 🌶️", "ข้าวมันไก่ 🍗", "ราเมน 🍜", "บุฟเฟ่ต์ 🥩", "ของกิน เองเลย 😂"];

const COLORS = ["#FBBF24", "#F87171", "#A78BFA", "#34D399", "#60A5FA", "#F472B6", "#94A3B8"];

export default function SpinWheel() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");
  const currentRotation = useRef(0);

  function spin() {
    if (spinning || items.length < 2) return;
    setSpinning(true);
    setResult(null);
    const extra = 360 * (5 + Math.floor(Math.random() * 5));
    const slice = 360 / items.length;
    const offset = Math.random() * slice;
    const total = currentRotation.current + extra + offset;
    currentRotation.current = total;
    setRotation(total);

    setTimeout(() => {
      const normalized = ((total % 360) + 360) % 360;
      const index = Math.floor(((360 - normalized) % 360) / slice) % items.length;
      setResult(items[index]);
      setSpinning(false);
    }, 4000);
  }

  function addItem() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setItems([...items, trimmed]);
    setNewItem("");
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
    setResult(null);
  }

  const slice = 360 / items.length;

  function polarToXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: 150 + r * Math.cos(rad), y: 150 + r * Math.sin(rad) };
  }

  function slicePath(i: number) {
    const start = i * slice;
    const end = start + slice;
    const p1 = polarToXY(start, 140);
    const p2 = polarToXY(end, 140);
    const large = slice > 180 ? 1 : 0;
    return `M150,150 L${p1.x},${p1.y} A140,140 0 ${large},1 ${p2.x},${p2.y} Z`;
  }

  function labelPos(i: number) {
    const mid = (i + 0.5) * slice;
    return polarToXY(mid, 95);
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <p className="text-gray-500 text-sm font-medium">🎡 วันนี้กินอะไรดี?</p>

      <div className="relative">
        <svg
          width="300"
          height="300"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,1)" : "none",
          }}
        >
          {items.map((item, i) => (
            <g key={i}>
              <path d={slicePath(i)} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="2" />
              <text
                x={labelPos(i).x}
                y={labelPos(i).y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="white"
                fontWeight="600"
                style={{ pointerEvents: "none" }}
              >
                {item.length > 8 ? item.slice(0, 8) + "…" : item}
              </text>
            </g>
          ))}
          <circle cx="150" cy="150" r="18" fill="white" stroke="#e9d5ff" strokeWidth="2" />
        </svg>
        {/* pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-2xl">▼</div>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="bg-pink-400 hover:bg-pink-500 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-full transition-colors"
      >
        {spinning ? "กำลังปั่น..." : "ปั่น!"}
      </button>

      {result && (
        <div className="bg-white border border-pink-100 rounded-2xl px-6 py-4 text-center w-full">
          <p className="text-gray-400 text-xs mb-1">ได้ผลแล้ว!</p>
          <p className="text-xl font-bold text-pink-500">{result}</p>
        </div>
      )}

      <div className="w-full bg-white border border-pink-100 rounded-2xl p-4">
        <p className="text-gray-400 text-xs mb-3">จัดการตัวเลือก</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1 bg-pink-50 text-pink-500 text-xs px-3 py-1 rounded-full">
              {item}
              <button onClick={() => removeItem(i)} className="text-pink-300 hover:text-pink-500 ml-1">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder="เพิ่มตัวเลือก..."
            className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm outline-none focus:border-pink-300"
          />
          <button onClick={addItem} className="bg-pink-100 text-pink-500 hover:bg-pink-200 rounded-full px-4 py-1.5 text-sm font-medium">เพิ่ม</button>
        </div>
      </div>
    </div>
  );
}
