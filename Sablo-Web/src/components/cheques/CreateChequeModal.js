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

export default function CreateChequeModal({ isOpen, onClose, onCreated, unit, currency, defaultDirection = "PAYABLE" }) {
  const { cards, activeCard } = useCard();

  const [direction, setDirection] = useState(defaultDirection);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [bank, setBank] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [note, setNote] = useState("");
  const [cardId, setCardId] = useState(activeCard?._id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isPayable = direction === "PAYABLE";

  const reset = () => {
    setDirection(defaultDirection); setAmount(""); setDueDate(null); setBank(""); setChequeNumber("");
    setCounterparty(""); setNote(""); setCardId(activeCard?._id ?? null); setError(null);
  };

  const handleCancel = () => { reset(); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const n = Number(amount);
    if (!n || n <= 0) return setError("مبلغ را وارد کنید");
    if (!dueDate) return setError("تاریخ سررسید را انتخاب کنید");

    setLoading(true);
    try {
      await api.post("/cheques", {
        direction,
        amount: currency === "IRT" ? n * 10 : n, // سرور ریال نگه می‌دارد
        dueDate: dateObjectToIso(dueDate),
        bank: bank.trim(),
        chequeNumber,
        counterparty: counterparty.trim(),
        note: note.trim(),
        cardId,
      });
      reset();
      onClose();
      onCreated();
    } catch (err) {
      if (err?.isSubscriptionExpired) { onClose(); return; } // پیام خرید اشتراک خودش نمایش داده می‌شود
      setError(errorText(err, "خطایی رخ داد"));
    } finally {
      setLoading(false);
    }
  };

  const dirBtn = (active, tone) =>
    `flex-1 rounded-2xl border-2 py-3 text-center transition-colors ${
      active ? tone : "bg-[var(--input-bg)] border-[color:var(--input-border)] hover:bg-[var(--hover)]"
    }`;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="ثبت چک"
      subtitle="چک پرداختی یا دریافتی و تاریخ سررسیدش"
    >
      <form onSubmit={submit} className="space-y-4">
        {/* نوع */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setDirection("RECEIVABLE")}
            aria-pressed={!isPayable}
            className={dirBtn(!isPayable, "bg-[var(--emerald-bg)] border-[color:var(--emerald-mid)] text-[color:var(--emerald-text)]")}
          >
            <span className="block text-sm font-extrabold">دریافتی</span>
            <span className="block text-[10px] text-[color:var(--muted)] mt-0.5">چک گرفتم</span>
          </button>
          <button
            type="button"
            onClick={() => setDirection("PAYABLE")}
            aria-pressed={isPayable}
            className={dirBtn(isPayable, "bg-[var(--rose-bg)] border-[color:var(--rose-mid)] text-[color:var(--rose-text)]")}
          >
            <span className="block text-sm font-extrabold">پرداختی</span>
            <span className="block text-[10px] text-[color:var(--muted)] mt-0.5">چک دادم</span>
          </button>
        </div>

        <div>
          <label className={LABEL} htmlFor="chq-amount">مبلغ ({unit})</label>
          <input
            id="chq-amount" type="text" inputMode="numeric" dir="ltr" placeholder="مثال: 5,000,000"
            value={formatAmountInput(amount)}
            onChange={(e) => setAmount(sanitizeDigits(e.target.value).slice(0, 15))}
            className={`${INPUT} text-left tracking-wider`}
          />
        </div>

        <div>
          <label className={LABEL}>تاریخ سررسید (شمسی)</label>
          <JalaliDatePicker value={dueDate} onChange={setDueDate} placeholder="انتخاب تاریخ" />
        </div>

        <div>
          <label className={LABEL} htmlFor="chq-cp">{isPayable ? "در وجه (اختیاری)" : "صادرکننده (اختیاری)"}</label>
          <input id="chq-cp" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} maxLength={60}
            placeholder="نام طرف حساب" className={`${INPUT} text-right`} />
        </div>

        <div className="flex gap-2.5">
          <div className="flex-1 min-w-0">
            <label className={LABEL} htmlFor="chq-bank">بانک (اختیاری)</label>
            <input id="chq-bank" value={bank} onChange={(e) => setBank(e.target.value)} maxLength={40}
              placeholder="مثال: ملی" className={`${INPUT} text-right`} />
          </div>
          <div className="flex-1 min-w-0">
            <label className={LABEL} htmlFor="chq-num">شماره چک (اختیاری)</label>
            <input id="chq-num" inputMode="numeric" dir="ltr" value={chequeNumber} maxLength={30}
              onChange={(e) => setChequeNumber(sanitizeDigits(e.target.value).slice(0, 30))}
              placeholder="شماره / صیاد" className={`${INPUT} text-left tracking-wider`} />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="chq-note">یادداشت (اختیاری)</label>
          <textarea id="chq-note" rows={2} maxLength={300} value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="هر نکته‌ای که لازم است یادت بماند"
            className={`${INPUT} text-right resize-none`} />
        </div>

        {cards.length > 0 && (
          <div>
            <label className={LABEL}>کارت پیش‌فرض برای زمان پاس شدن</label>
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

        <p className={HINT}>ثبت چک روی موجودی اثر ندارد؛ فقط وقتی «پاس شد» را بزنی، تراکنشش ساخته می‌شود.</p>

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
          <button type="button" onClick={handleCancel}
            className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors">
            انصراف
          </button>
        </div>
      </form>
    </Sheet>
  );
}
