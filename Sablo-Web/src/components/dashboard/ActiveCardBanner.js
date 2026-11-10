"use client";
import { X } from "lucide-react";
import { useCard } from "@/context/cardContext";

export default function ActiveCardBanner() {
  const { activeCard, setActiveCard } = useCard();
  if (!activeCard) return null;

  return (
    <div
      className="flex items-center justify-between rounded-2xl px-4 py-3 mb-4 text-white"
      style={{ backgroundColor: activeCard.color }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{activeCard.icon}</span>
        <div className="text-right">
          <p className="text-[11px] opacity-75">فیلتر فعال</p>
          <p className="text-sm font-bold">{activeCard.name}</p>
        </div>
      </div>
      <button
        onClick={() => setActiveCard(null)}
        className="flex flex-col items-center gap-0.5 opacity-80 hover:opacity-100"
      >
        <X size={16} />
        <span className="text-[10px]">لغو فیلتر</span>
      </button>
    </div>
  );
}
