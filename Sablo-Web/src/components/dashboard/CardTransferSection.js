"use client";
import { useEffect, useState } from "react";
import { ArrowLeftRight, X, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useCard } from "@/context/cardContext";
import { useCurrency } from "@/context/currencyContext";
import { sanitizeDigits } from "@/utils/formatters";

// انتخاب کارت به‌صورت چیپ؛ کارتِ سمت مقابل غیرفعال می‌شود
function CardChips({ cards, selectedId, disabledId, disabled, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card) => {
        const selected = selectedId === card._id;
        const blocked = disabledId === card._id;
        return (
          <button
            key={card._id}
            type="button"
            disabled={blocked || disabled}
            aria-pressed={selected}
            onClick={() => onSelect(card._id)}
            className={`flex max-w-[11rem] items-center gap-1.5 rounded-xl border-[1.5px] px-3 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed ${
              blocked ? "opacity-35" : ""
            } ${selected ? "text-white" : "text-[color:var(--ink)] bg-[var(--bg)]"}`}
            style={{
              borderColor: card.color,
              backgroundColor: selected ? card.color : undefined,
            }}
          >
            <span className="text-sm">{card.icon}</span>
            <span className="truncate">{card.name}</span>
            {selected && <CheckCircle2 size={14} />}
          </button>
        );
      })}
    </div>
  );
}

export default function CardTransferSection({ onSuccess }) {
  const { cards } = useCard();
  const { display, unit } = useCurrency();

  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState(null);
  const [toId, setToId] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  const isToman = unit === "تومان";
  const canTransfer = cards.length >= 2;

  // عددی که کاربر به واحد فعلی وارد کرده / مبلغ واقعی برای بک‌اند (همیشه ریال)
  const enteredAmount = Number(sanitizeDigits(amount)) || 0;
  const amountInRial = isToman ? enteredAmount * 10 : enteredAmount;

  const fromCard = cards.find((c) => c._id === fromId);
  const toCard = cards.find((c) => c._id === toId);
  const isValid = !!fromCard && !!toCard && amountInRial > 0;

  const reset = () => {
    setFromId(null);
    setToId(null);
    setAmount("");
    setDescription("");
    setError("");
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
    reset();
  };

  // بستن با Escape و قفل اسکرول صفحه‌ی پشت مودال
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && (setOpen(false), reset());
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, loading]);

  const handleAmountChange = (e) => {
    const digits = sanitizeDigits(e.target.value);
    setAmount(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    setError("");
  };

  const swapCards = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromCard || !toCard) return setError("کارت مبدا و مقصد را انتخاب کن");
    if (fromId === toId) return setError("کارت مبدا و مقصد نمی‌تواند یکی باشد");
    if (!amountInRial || amountInRial <= 0) return setError("مبلغ انتقال را وارد کن");
    if (!Number.isSafeInteger(amountInRial)) return setError("مبلغ واردشده معتبر نیست");

    setLoading(true);
    setError("");
    try {
      await api.post("/finance/transfer", {
        fromCardId: fromId,
        toCardId: toId,
        amount: amountInRial, // همیشه ریال
        description: description.trim(),
      });
      setOpen(false);
      reset();
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "خطا در ثبت انتقال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!canTransfer}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--brand)] py-3 text-[13px] font-semibold text-[color:var(--brand)] transition-colors hover:bg-[var(--brand-light)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <ArrowLeftRight size={16} />
        {canTransfer ? "انتقال بین کارت‌ها" : "برای انتقال حداقل ۲ کارت لازم است"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] backdrop-blur-sm sm:items-center sm:p-4"
          onClick={close}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-label="انتقال بین کارت‌ها"
            dir="rtl"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[color:var(--border)] bg-[var(--card)] p-5 pb-8 shadow-xl sm:rounded-3xl sm:pb-5"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border)] sm:hidden" />

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[color:var(--ink)]">انتقال بین کارت‌ها</h3>
              <button
                type="button"
                onClick={close}
                aria-label="بستن"
                className="rounded-full p-1 transition-colors hover:bg-[var(--hover)]"
              >
                <X size={20} className="text-[color:var(--muted)]" />
              </button>
            </div>

            <p className="mb-2 text-xs text-[color:var(--muted)]">از کارت</p>
            <CardChips cards={cards} selectedId={fromId} disabledId={toId} disabled={loading} onSelect={(id) => { setFromId(id); setError(""); }} />

            <div className="my-2 flex justify-center">
              <button
                type="button"
                onClick={swapCards}
                disabled={loading || (!fromId && !toId)}
                aria-label="جابه‌جایی مبدا و مقصد"
                className="rounded-full p-2 text-[color:var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[color:var(--brand)] disabled:opacity-40"
              >
                <ArrowLeftRight size={18} className="rotate-90" />
              </button>
            </div>

            <p className="mb-2 text-xs text-[color:var(--muted)]">به کارت</p>
            <CardChips cards={cards} selectedId={toId} disabledId={fromId} disabled={loading} onSelect={(id) => { setToId(id); setError(""); }} />

            <label htmlFor="transfer-amount" className="mb-2 mt-4 block text-xs text-[color:var(--muted)]">
              مبلغ ({unit})
            </label>
            <div className="flex items-center gap-2">
              <input
                id="transfer-amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={amount}
                onChange={handleAmountChange}
                placeholder={isToman ? "مثلاً ۲٬۵۰۰٬۰۰۰" : "مثلاً ۲۵٬۰۰۰٬۰۰۰"}
                className="tabular min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[var(--bg)] px-4 py-3 text-right text-[15px] text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted-light)] focus:border-[color:var(--brand)]"
              />
              <span className="min-w-10 text-center text-[13px] font-bold text-[color:var(--muted)]">{unit}</span>
            </div>
            {amountInRial > 0 && (
              <p className="mt-1.5 text-xs font-semibold text-[color:var(--brand)]">
                مبلغ انتقال: {display(amountInRial)} {unit}
              </p>
            )}

            <label htmlFor="transfer-desc" className="mb-2 mt-4 block text-xs text-[color:var(--muted)]">
              توضیح (اختیاری)
            </label>
            <input
              id="transfer-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              placeholder="مثلاً شارژ کارت حقوق"
              className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--bg)] px-4 py-3 text-right text-[15px] text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted-light)] focus:border-[color:var(--brand)]"
            />

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-light)] px-3 py-2 text-xs font-semibold text-[color:var(--danger)]">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={loading || !isValid}
                className="flex flex-[2] items-center justify-center rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "ثبت انتقال"}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={loading}
                className="flex-1 rounded-xl border border-[color:var(--border)] py-3 text-sm font-semibold text-[color:var(--muted)] transition-colors hover:bg-[var(--hover)]"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300"
        style={{ opacity: toast ? 1 : 0, transform: `translateX(-50%) translateY(${toast ? 0 : 16}px)` }}
      >
        انتقال ثبت شد
      </div>
    </>
  );
}

