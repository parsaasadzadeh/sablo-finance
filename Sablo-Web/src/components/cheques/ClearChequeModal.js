"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCard } from "@/context/cardContext";
import Sheet, { LABEL, HINT, chip } from "@/components/shared/Sheet";

/**
 * انتخاب کارت هنگام «پاس شد / وصول شد».
 * با key روی شناسه‌ی چک از نو ساخته می‌شود تا کارت پیش‌فرض هر چک درست بیاید.
 */
export default function ClearChequeModal({ cheque, onClose, onConfirm, display, unit }) {
  const { cards } = useCard();
  const [cardId, setCardId] = useState(
    cheque?.cardId && cards.some((c) => c._id === cheque.cardId) ? cheque.cardId : null
  );
  const [loading, setLoading] = useState(false);

  if (!cheque) return null;
  const isPayable = cheque.direction === "PAYABLE";

  const confirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm(cheque, cardId); // خطاها را والد نشان می‌دهد
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      isOpen
      onClose={() => { if (!loading) onClose(); }}
      title={isPayable ? "پاس شدن چک" : "وصول چک"}
      subtitle={`${cheque.counterparty || "چک"} — ${display(cheque.amount)} ${unit}`}
    >
      <div className="space-y-4">
        {cards.length > 0 && (
          <div>
            <label className={LABEL}>{isPayable ? "از کدام کارت پرداخت شد؟" : "به کدام کارت واریز شد؟"}</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setCardId(null)} className={chip(cardId === null)}>بدون کارت</button>
              {cards.map((c) => (
                <button key={c._id} type="button" onClick={() => setCardId(c._id)} className={chip(cardId === c._id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className={HINT}>
          {isPayable
            ? "با تأیید، یک تراکنش هزینه برای این چک ساخته می‌شود و از موجودی کم می‌شود."
            : "با تأیید، یک تراکنش درآمد برای این چک ساخته می‌شود و به موجودی اضافه می‌شود."}
          {" "}این تراکنش جزو درآمد و هزینه‌ی ماه حساب نمی‌شود.
        </p>

        <div className="flex gap-2.5 pt-1">
          <button type="button" onClick={confirm} disabled={loading}
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isPayable ? "تأیید پاس شدن" : "تأیید وصول"}
          </button>
          <button type="button" onClick={onClose} disabled={loading}
            className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors">
            انصراف
          </button>
        </div>
      </div>
    </Sheet>
  );
}
