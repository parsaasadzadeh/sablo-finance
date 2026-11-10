"use client";
import { useState } from "react";
import { useCurrency } from "@/context/currencyContext";

const OPTIONS = [
  { value: "IRT", label: "تومان" },
  { value: "IRR", label: "ریال" },
];

export default function CurrencyToggle() {
  const { currency, changeCurrency } = useCurrency();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(null);

  const pendingLabel = pendingCurrency === "IRT" ? "تومان" : "ریال";

  const handleClick = (val) => {
    if (val === currency) return;
    setPendingCurrency(val);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!pendingCurrency) return;
    await changeCurrency(pendingCurrency);
    setShowConfirm(false);
    setPendingCurrency(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingCurrency(null);
  };

  return (
    <>
      <div className="flex items-center justify-between bg-[var(--card)] border border-[color:var(--border)] rounded-2xl px-4 py-3 mb-4">
        <span className="text-sm font-semibold text-[color:var(--ink)]">واحد نمایش مبالغ</span>
        <div className="flex rounded-xl border border-[color:var(--border)] overflow-hidden">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleClick(opt.value)}
              aria-pressed={currency === opt.value}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${
                currency === opt.value
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--card)] text-[color:var(--muted)] hover:text-[color:var(--ink)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-[color:var(--ink)] mb-2">
              تغییر واحد به {pendingLabel}
            </h3>
            <p className="text-sm text-[color:var(--muted)] leading-6 mb-5">
              مبالغ نمایش داده شده به {pendingLabel} تبدیل می‌شوند.
              <br />
              <span className="text-[color:var(--warning)] font-medium text-xs mt-1 block">
                ⚠️ هنگام ثبت تراکنش جدید، مبلغ را به {pendingLabel} وارد کنید.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
              >
                تأیید
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] hover:bg-[var(--hover)] font-semibold rounded-xl py-2.5 text-sm transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
