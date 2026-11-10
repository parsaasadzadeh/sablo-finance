"use client";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";

/**
 * قالب مشترک صفحه‌های داخلی: دکمه‌ی بازگشت (راست)، عنوان (وسط)، دکمه‌ی اصلی (چپ).
 * همان ساختار صفحه‌ی «وام‌های من».
 */
export default function PageShell({ title, actionLabel, onAction, children }) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/dashboard");
  };

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)]">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center mb-5 gap-2">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors min-w-[64px]"
          >
            <ArrowRight size={15} /> بازگشت
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-[color:var(--ink)]">{title}</h1>
          {onAction ? (
            <button
              onClick={onAction}
              className="flex items-center gap-1.5 bg-[var(--brand)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
            >
              <Plus size={14} /> {actionLabel}
            </button>
          ) : (
            <div className="min-w-[64px]" />
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
