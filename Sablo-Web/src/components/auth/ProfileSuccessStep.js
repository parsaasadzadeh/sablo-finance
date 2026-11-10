"use client";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ProfileSuccessStep() {
  return (
    <div className="text-center py-6 animate-[fadeIn_.25s_ease]">
      <div className="w-14 h-14 rounded-full bg-[#0F6F5C]/10 text-[#0F6F5C] flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={28} />
      </div>
      <h1 className="text-lg font-bold text-[#26241F] mb-1.5">اطلاعات با موفقیت ثبت شد</h1>
      <p className="text-sm text-[#8A8273] flex items-center justify-center gap-1">
        <span>در حال انتقال به داشبورد مالی</span>
        <ArrowRight size={14} className="animate-pulse rotate-180 text-[#0F6F5C]" />
      </p>
    </div>
  );
}