"use client";
import { useState, useEffect } from "react";
import { X, Ban, Loader2 } from "lucide-react";
import api from "@/lib/axios";

const LABEL =
  "block text-xs font-semibold text-[color:var(--ink-light)] mb-2 text-right";
const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]";

const formatAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
};
const unformatAmount = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

/**
 * selectedCardId:
 *   string  -> id of the selected card
 *   null    -> "no card" option
 */
export default function DepositToGoalModal({
  visible,
  onClose,
  onSuccess,
  goalId,
  goalTitle,
  unit,
  currency, // "IRR" | "IRT"
  cards = [],
  remaining, // optional, in Rial
  display, // optional, (amountInRial) => string
}) {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [amount, setAmount] = useState(""); // formatted string, e.g. "5,000,000"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setAmount("");
    setSelectedCardId(null);
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  // Esc to close + lock body scroll while open
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) {
        resetForm();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line
  }, [visible, loading]);

  if (!visible) return null;

  const handleSubmit = async () => {
    setError(null);
    const numericAmount = unformatAmount(amount);
    if (numericAmount <= 0) {
      setError("مبلغ واریز را وارد کنید");
      return;
    }
    const amountInRial = currency === "IRT" ? numericAmount * 10 : numericAmount;

    if (typeof remaining === "number" && amountInRial > remaining) {
      setError(
        display
          ? `مبلغ نمی‌تواند بیشتر از باقی‌مانده هدف (${display(remaining)} ${unit}) باشد`
          : "مبلغ نمی‌تواند بیشتر از باقی‌مانده هدف باشد"
      );
      return;
    }

    setLoading(true);
    try {
      await api.post(`/goals/${goalId}/deposit`, {
        cardId: selectedCardId,
        amount: amountInRial,
      });
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`واریز به ${goalTitle}`}
    >
      <style>{`
        @keyframes depositSheetUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .deposit-sheet { animation: depositSheetUp .22s ease-out; }
        @media (prefers-reduced-motion: reduce) { .deposit-sheet { animation: none; } }
      `}</style>

      <div
        className="deposit-sheet w-full sm:max-w-md bg-[var(--card)] border border-[color:var(--border)] rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="flex-1 truncate text-base font-bold text-[color:var(--ink)] text-right">
            واریز به «{goalTitle}»
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="بستن"
            className="text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card selection (optional) */}
        <label className={LABEL}>از کدام کارت واریز شود؟ (اختیاری)</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {cards.map((card) => {
            const selected = selectedCardId === card._id;
            return (
              <button
                key={card._id}
                type="button"
                onClick={() => setSelectedCardId(card._id)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-[color:var(--ink)] transition-colors"
                style={{
                  border: `1.5px solid ${selected ? card.color : "var(--border)"}`,
                  backgroundColor: selected ? `${card.color}18` : "transparent",
                  color: selected ? card.color : undefined,
                  fontWeight: selected ? 700 : 400,
                }}
              >
                <span className="text-sm">{card.icon}</span>
                <span className="max-w-[100px] truncate">{card.name}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedCardId(null)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors"
            style={{
              border: `1.5px solid ${
                selectedCardId === null ? "var(--brand)" : "var(--border)"
              }`,
              backgroundColor:
                selectedCardId === null
                  ? "color-mix(in srgb, var(--brand) 10%, transparent)"
                  : "transparent",
              color:
                selectedCardId === null ? "var(--brand)" : "var(--ink)",
              fontWeight: selectedCardId === null ? 700 : 400,
            }}
          >
            <Ban size={14} />
            بدون ثبت کارت
          </button>
        </div>

        {/* Amount */}
        <label className={LABEL}>مبلغ واریز ({unit})</label>
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          autoFocus
          placeholder={`مبلغ را به ${unit} وارد کنید`}
          value={amount}
          onChange={(e) => {
            setAmount(formatAmount(e.target.value));
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
          className={`${INPUT} text-left tracking-wider`}
        />

        {typeof remaining === "number" && display && (
          <p className="text-[11px] text-[color:var(--muted)] text-right mt-2">
            باقی‌مانده تا هدف: {display(remaining)} {unit}
          </p>
        )}

        {error && (
          <p className="text-xs text-[color:var(--danger)] text-right mt-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2.5 mt-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            ثبت واریز
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bg-[var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-5 py-3 text-sm hover:opacity-80 transition-opacity"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
