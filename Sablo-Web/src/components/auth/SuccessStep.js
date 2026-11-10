"use client";
import { ShieldCheck } from "lucide-react";

export default function SuccessStep() {
  return (
    <div className="mt-6 text-center py-4 animate-[fadeIn_.25s_ease]">
      <div className="w-14 h-14 rounded-full bg-[#0F6F5C]/10 text-[#0F6F5C] flex items-center justify-center mx-auto mb-4">
        <ShieldCheck size={26} />
      </div>
      <h1 className="text-lg font-bold text-[#26241F] mb-1.5">بازگشت مجدد شما موفقیت‌آمیز بود!</h1>
      <p className="text-sm text-[#8A8273]">درحال انتقال به داشبورد...</p>
    </div>
  );
}