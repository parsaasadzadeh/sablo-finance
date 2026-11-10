"use client";
import { useEffect } from "react";
import { Ban, X } from "lucide-react";

export default function PayInstallmentModal({ visible, onClose, onConfirm, cards = [] }) {
  // بستن با Escape و قفل اسکرول صفحه‌ی پشت مودال
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--overlay)] backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 border border-[color:var(--border)] shadow-xl"
      >
        <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-1">
          <button onClick={onClose} aria-label="بستن" className="p-1 rounded-full hover:bg-[var(--hover)]">
            <X size={18} className="text-[color:var(--muted)]" />
          </button>
          <h3 className="text-sm font-bold text-[color:var(--ink)]">پرداخت از کدام کارت؟</h3>
        </div>
        <p className="text-[11px] text-[color:var(--muted)] text-right mb-4">
          یک کارت رو انتخاب کن، یا بدون ثبت کارت پرداخت رو تایید کن
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cards.map((card) => (
            <button
              key={card._id}
              onClick={() => onConfirm(card._id)}
              className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 rounded-xl border border-[color:var(--border)] hover:bg-[var(--hover)] transition-colors text-right"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: card.color + "22" }}
              >
                {card.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[color:var(--ink)]">{card.name}</p>
                {card.description && (
                  <p className="text-[11px] text-[color:var(--muted)]">{card.description}</p>
                )}
              </div>
            </button>
          ))}

          {/* بدون کارت */}
          <button
            onClick={() => onConfirm(null)}
            className="w-full flex flex-row-reverse items-center gap-3 px-4 py-3 rounded-xl border border-[color:var(--border)] hover:bg-[var(--hover)] transition-colors text-right"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg)] flex-shrink-0">
              <Ban size={16} className="text-[color:var(--muted)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[color:var(--ink)]">بدون ثبت کارت</p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl py-2.5 text-xs hover:bg-[var(--hover)] transition-colors"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
