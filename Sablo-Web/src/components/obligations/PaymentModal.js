"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useCard } from "@/context/cardContext";
import { errorText } from "@/utils/apiError";
import { sanitizeDigits, formatAmountInput } from "@/utils/formatters";
import { dateObjectToIso } from "@/utils/jalali";
import Sheet, { LABEL, HINT, INPUT, chip } from "@/components/shared/Sheet";
import JalaliDatePicker from "@/components/shared/JalaliDatePicker";

export default function PaymentModal({ item, onClose, onDone, display, unit, currency }) {
  const { cards } = useCard();

  const [amount, setAmount] = useState("");
  const [fullPressed, setFullPressed] = useState(false); // «تسویه کامل» → دقیقاً باقیمانده‌ی ریالی ارسال می‌شود
  const [date, setDate] = useState(null);
  const [note, setNote] = useState("");
  // null = «همه حساب‌ها»؛ پیش‌فرض: کارت ثبت اولیه. فرم با key روی هر مورد از نو ساخته می‌شود
  const [cardId, setCardId] = useState(item?.cardId ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!item) return null;
  const isDebt = item.kind === "DEBT";

  const setFull = () => {
    const inUnit = currency === "IRT" ? Math.floor(item.remainingAmount / 10) : item.remainingAmount;
    setAmount(String(inUnit));
    setFullPressed(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const n = Number(amount);
    if (!n || n <= 0) return setError("مبلغ را وارد کنید");

    // «تسویه کامل» مبلغ دقیق باقیمانده را می‌فرستد (جلوگیری از خطای گرد کردن ریال/تومان)
    const rial = fullPressed ? item.remainingAmount : currency === "IRT" ? n * 10 : n;
    if (rial > item.remainingAmount) return setError("مبلغ نمی‌تواند بیشتر از باقیمانده باشد");

    setLoading(true);
    try {
      await api.post(`/obligations/${item._id}/payments`, {
        amount: rial,
        date: dateObjectToIso(date),
        note: note.trim(),
        ...(item.affectsBalance ? { cardId } : {}),
      });
      onClose();
      onDone();
    } catch (err) {
      if (err?.isSubscriptionExpired) { onClose(); return; }
      setError(errorText(err, "خطایی رخ داد"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      isOpen
      onClose={onClose}
      title={`${isDebt ? "ثبت پرداخت به" : "ثبت دریافت از"} ${item.person}`}
      subtitle={`باقیمانده: ${display(item.remainingAmount)} ${unit}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={setFull} className="text-xs font-bold text-[color:var(--brand)] mb-1.5">
              تسویه کامل
            </button>
            <label className={LABEL} htmlFor="pay-amount">مبلغ ({unit})</label>
          </div>
          <input
            id="pay-amount" type="text" inputMode="numeric" dir="ltr" placeholder="مثال: 500,000" autoFocus
            value={formatAmountInput(amount)}
            onChange={(e) => { setAmount(sanitizeDigits(e.target.value).slice(0, 15)); setFullPressed(false); }}
            className={`${INPUT} text-left tracking-wider`}
          />
        </div>

        <div>
          <label className={LABEL}>تاریخ (شمسی)</label>
          <JalaliDatePicker value={date} onChange={setDate} placeholder="امروز" />
        </div>

        <div>
          <label className={LABEL} htmlFor="pay-note">یادداشت (اختیاری)</label>
          <input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200}
            placeholder="مثال: کارت‌به‌کارت" className={`${INPUT} text-right`} />
        </div>

        {item.affectsBalance && (
          <div>
            <label className={LABEL}>اثر روی کدام کارت؟</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setCardId(null)} className={chip(cardId === null)}>همه حساب‌ها</button>
              {cards.map((c) => (
                <button key={c._id} type="button" onClick={() => setCardId(c._id)} className={chip(cardId === c._id)}>
                  {c.name}
                </button>
              ))}
            </div>
            <p className={`${HINT} mt-2`}>
              {isDebt ? "پرداخت از" : "دریافت روی"} کارت انتخابی ثبت می‌شود؛ «همه حساب‌ها» فقط موجودی کل را تغییر می‌دهد.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-[var(--danger-light)] border border-[color:var(--danger-border)] rounded-xl px-4 py-3">
            <p className="text-xs text-[color:var(--danger)] text-right">{error}</p>
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button type="submit" disabled={loading}
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors">
            {loading && <Loader2 size={14} className="animate-spin" />}
            ثبت
          </button>
          <button type="button" onClick={onClose}
            className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors">
            انصراف
          </button>
        </div>
      </form>
    </Sheet>
  );
}
