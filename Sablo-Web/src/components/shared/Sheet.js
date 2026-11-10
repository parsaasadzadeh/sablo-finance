"use client";
import { useEffect } from "react";

/** کانتینر مودال (روی موبایل از پایین باز می‌شود) هم‌سبک CreateLoanModal */
export default function Sheet({ isOpen, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-[var(--card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 border border-[color:var(--border)] shadow-xl max-h-[92vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-4 sm:hidden" />
        <h3 className="text-base font-bold text-[color:var(--ink)] mb-1 text-right">{title}</h3>
        {subtitle && <p className="text-xs text-[color:var(--muted)] text-right mb-4">{subtitle}</p>}
        {!subtitle && <div className="mb-4" />}
        {children}
      </div>
    </div>
  );
}

// کلاس‌های مشترک فرم‌ها (همان مقادیر CreateLoanModal)
export const LABEL = "block text-xs font-medium text-[color:var(--ink-light)] mb-1.5 text-right";
export const HINT = "text-[10px] text-[color:var(--muted)] text-right";
export const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]";
export const chip = (active) =>
  `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
    active
      ? "bg-[var(--brand-light)] border-[color:var(--brand)] text-[color:var(--brand)]"
      : "bg-[var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--ink-light)] hover:bg-[var(--hover)]"
  }`;
