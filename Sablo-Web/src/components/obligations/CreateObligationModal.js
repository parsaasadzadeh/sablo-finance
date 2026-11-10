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

export default function CreateObligationModal({ isOpen, onClose, onCreated, unit, currency, defaultKind = "DEBT" }) {
  const { cards } = useCard();

  const [kind, setKind] = useState(defaultKind);
  const [person, setPerson] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [description, setDescription] = useState("");
  const [affectsBalance, setAffectsBalance] = useState(false);
  const [cardId, setCardId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDebt = kind === "DEBT";

  const reset = () => {
    setKind(defaultKind); setPerson(""); setTitle(""); setAmount(""); setDate(null); setDueDate(null);
    setDescription(""); setAffectsBalance(false); setCardId(null); setError(null);
  };

  const handleCancel = () => { reset(); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const n = Number(amount);
    if (!person.trim()) return setError("نام شخص را وارد کنید");
    if (!n || n <= 0) return setError("مبلغ را وارد کنید");

    setLoading(true);
    try {
      await api.post("/obligations", {
        kind,
        person: person.trim(),
        title: title.trim(),
        amount: currency === "IRT" ? n * 10 : n, // سرور ریال نگه می‌دارد
        date: dateObjectToIso(date),
        dueDate: dateObjectToIso(dueDate) ?? null,
        description: description.trim(),
        affectsBalance,
        cardId: affectsBalance ? cardId : null,
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

  const kindBtn = (active, tone) =>
    `flex-1 rounded-2xl border-2 py-3 text-center transition-colors ${
      active ? "" : "bg-[var(--input-bg)] border-[color:var(--input-border)] hover:bg-[var(--hover)]"
    } ${active ? tone : ""}`;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="ثبت طلب یا بدهی"
      subtitle="قرض‌های شخصی بین خودت و دوستان و آشنایان"
    >
      <form onSubmit={submit} className="space-y-4">
        {/* نوع */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setKind("CREDIT")}
            aria-pressed={!isDebt}
            className={kindBtn(!isDebt, "bg-[var(--emerald-bg)] border-[color:var(--emerald-mid)] text-[color:var(--emerald-text)]")}
          >
            <span className="block text-sm font-extrabold">طلب من</span>
            <span className="block text-[10px] text-[color:var(--muted)] mt-0.5">به کسی قرض دادم</span>
          </button>
          <button
            type="button"
            onClick={() => setKind("DEBT")}
            aria-pressed={isDebt}
            className={kindBtn(isDebt, "bg-[var(--rose-bg)] border-[color:var(--rose-mid)] text-[color:var(--rose-text)]")}
          >
            <span className="block text-sm font-extrabold">بدهی من</span>
            <span className="block text-[10px] text-[color:var(--muted)] mt-0.5">از کسی قرض گرفتم</span>
          </button>
        </div>

        <div>
          <label className={LABEL} htmlFor="ob-person">{isDebt ? "بدهکار به چه کسی؟" : "چه کسی بدهکار است؟"}</label>
          <input id="ob-person" value={person} onChange={(e) => setPerson(e.target.value)} maxLength={60}
            placeholder="نام شخص" className={`${INPUT} text-right`} />
        </div>

        <div>
          <label className={LABEL} htmlFor="ob-title">عنوان (اختیاری)</label>
          <input id="ob-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            placeholder="مثال: قرض برای خرید لپ‌تاپ" className={`${INPUT} text-right`} />
        </div>

        <div>
          <label className={LABEL} htmlFor="ob-amount">مبلغ ({unit})</label>
          <input
            id="ob-amount" type="text" inputMode="numeric" dir="ltr" placeholder="مثال: 5,000,000"
            value={formatAmountInput(amount)}
            onChange={(e) => setAmount(sanitizeDigits(e.target.value).slice(0, 15))}
            className={`${INPUT} text-left tracking-wider`}
          />
        </div>

        <div>
          <label className={LABEL}>تاریخ قرض (شمسی)</label>
          <JalaliDatePicker value={date} onChange={setDate} placeholder="امروز" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            {dueDate ? (
              <button type="button" onClick={() => setDueDate(null)}
                className="text-[11px] font-bold text-[color:var(--rose-mid)] mb-1.5">حذف سررسید</button>
            ) : <span />}
            <label className={LABEL}>سررسید (اختیاری)</label>
          </div>
          <JalaliDatePicker value={dueDate} onChange={setDueDate} placeholder="بدون سررسید" />
        </div>

        <div>
          <label className={LABEL} htmlFor="ob-desc">توضیحات (اختیاری)</label>
          <textarea id="ob-desc" rows={2} maxLength={300} value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="هر نکته‌ای که لازم است یادت بماند"
            className={`${INPUT} text-right resize-none`} />
        </div>

        {/* اثر روی موجودی */}
        <label className="flex items-center gap-3 bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-2xl p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={affectsBalance}
            onChange={(e) => setAffectsBalance(e.target.checked)}
            className="w-4 h-4 accent-[var(--brand)] shrink-0"
          />
          <span className="min-w-0">
            <span className="block text-[13px] font-bold">روی موجودی من اثر بگذارد</span>
            <span className="block text-[10px] text-[color:var(--muted)] mt-0.5">
              {isDebt
                ? "پول قرض‌گرفته به موجودی اضافه و پرداخت‌ها کم می‌شود"
                : "پول قرض‌داده از موجودی کم و دریافت‌ها اضافه می‌شود"}
            </span>
          </span>
        </label>

        {affectsBalance && cards.length > 0 && (
          <div>
            <label className={LABEL}>کارت</label>
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

        {affectsBalance && <p className={HINT}>بعد از ثبت، این گزینه و کارت قابل تغییر نیستند.</p>}

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
