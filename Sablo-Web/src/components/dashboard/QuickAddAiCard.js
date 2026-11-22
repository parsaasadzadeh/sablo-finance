"use client";
import Link from "next/link";
import { Zap, ChevronLeft } from "lucide-react";

/** کارت ورود به «ثبت تراکنش با سرعت نور» در داشبورد */
export default function QuickAddAiCard() {
  return (
    <Link
      href="/ai-chat"
      prefetch
      className="flex items-center gap-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] rounded-2xl p-3.5 mb-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
    >
      <div className="w-[42px] h-[42px] rounded-[14px] bg-white/20 flex items-center justify-center shrink-0">
        <Zap size={20} className="text-white" fill="currentColor" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">ثبت تراکنش با سرعت نور</p>
        <p className="text-[11px] leading-[17px] text-white/85 mt-0.5">
          فقط بنویس «دیروز ۸۰ هزار تومن بنزین زدم»، بقیه‌اش با ما
        </p>
      </div>
      <ChevronLeft size={20} className="text-white/85 shrink-0" />
    </Link>
  );
}
