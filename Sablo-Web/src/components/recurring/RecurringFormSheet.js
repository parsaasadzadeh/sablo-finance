"use client";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Repeat } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext";
import { errorText } from "@/utils/apiError";
import { formatAmountInput, sanitizeDigits, toPersianNum } from "@/utils/formatters";
import { dateObjectToIso } from "@/utils/jalali";
import {
  FREQUENCIES, WEEKDAY_CHIPS, MONTHS, DAYS_OF_MONTH, scheduleText, isoToDateObject,
} from "@/utils/recurring";
import Sheet, { LABEL, HINT, INPUT, chip } from "@/components/shared/Sheet";
import JalaliDatePicker from "@/components/shared/JalaliDatePicker";
import Toggle from "@/components/shared/Toggle";

const centered = (active) => `${chip(active)} justify-center`;

const dayCell = (active) =>
  `h-9 rounded-lg text-xs font-semibold border transition-colors ${
    active
      ? "bg-[var(--brand-light)] border-[color:var(--brand)] text-[color:var(--brand)]"
      : "bg-[var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--ink-light)] hover:bg-[var(--hover)]"
  }`;

export default function RecurringFormSheet({
  isOpen, onClose, editing, categories = [], incomeSources = [], onSaved,
}) {
  const { currency, unit } = useCurrency();
  const { cards } = useCard();

  const [type, setType] = useState("EXPENSE");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(""); // فقط رقم، به واحد نمایشی (تومان/ریال)
  const [frequency, setFrequency] = useState("MONTHLY");
  const [dayOfWeek, setDayOfWeek] = useState(6);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [monthOfYear, setMonthOfYear] = useState(1);
  const [startDate, setStartDate] = useState(null); // DateObject شمسی
  const [endDate, setEndDate] = useState(null);
  const [category, setCategory] = useState(null);
  const [incomeSourceId, setIncomeSourceId] = useState(null);
  const [cardId, setCardId] = useState(null);
  const [description, setDescription] = useState("");
  const [activateNow, setActivateNow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // هر بار که فرم باز می‌شود مقادیر را از نو بساز
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editing) {
      setType(editing.type);
      setTitle(editing.title ?? "");
      setAmount(String(currency === "IRT" ? Math.round(editing.amount / 10) : editing.amount));
      setFrequency(editing.frequency);
      setDayOfWeek(editing.dayOfWeek ?? 6);
      setDayOfMonth(editing.dayOfMonth ?? 1);
      setMonthOfYear(editing.monthOfYear ?? 1);
      setStartDate(isoToDateObject(editing.startDate));
      setEndDate(isoToDateObject(editing.endDate));
      setCategory(editing.category ?? null);
      setIncomeSourceId(editing.incomeSourceId ?? null);
      setCardId(editing.cardId ?? null);
      setDescription(editing.description ?? "");
    } else {
      setType("EXPENSE");
      setTitle("");
      setAmount("");
      setFrequency("MONTHLY");
      setDayOfWeek(6);
      setDayOfMonth(1);
      setMonthOfYear(1);
      setStartDate(null);
      setEndDate(null);
      setCategory(null);
      setIncomeSourceId(null);
      setCardId(null);
      setDescription("");
      setActivateNow(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editing]);

  const preview = useMemo(() => {
    const n = Number(amount);
    const sched = scheduleText(frequency, dayOfWeek, dayOfMonth, monthOfYear);
    return n ? `${sched}، ${n.toLocaleString("fa-IR")} ${unit}` : sched;
  }, [amount, frequency, dayOfWeek, dayOfMonth, monthOfYear, unit]);

  const handleClose = () => { if (!loading) onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const trimmed = title.trim();
    const raw = Number(amount);
    const startIso = startDate ? dateObjectToIso(startDate) ?? null : null;
    const endIso = endDate ? dateObjectToIso(endDate) ?? null : null;

    if (!trimmed) return setError("عنوان را وارد کنید");
    if (!raw || raw <= 0) return setError("مبلغ باید بیشتر از صفر باشد");
    if (startIso && endIso && endIso < startIso) {
      return setError("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
    }

    const body = {
      type,
      title: trimmed,
      amount: currency === "IRT" ? raw * 10 : raw,
      description: description.trim(),
      frequency,
      cardId,
      category: type === "EXPENSE" ? category : null,
      startDate: startIso,
      endDate: endIso,
    };
    if (type === "INCOME") body.incomeSourceId = incomeSourceId;
    if (frequency === "WEEKLY") body.dayOfWeek = dayOfWeek;
    if (frequency === "MONTHLY" || frequency === "YEARLY") body.dayOfMonth = dayOfMonth;
    if (frequency === "YEARLY") body.monthOfYear = monthOfYear;

    setLoading(true);
    try {
      if (editing) {
        const res = await api.put(`/recurring/${editing._id}`, body);
        onSaved(res.data.recurring, false);
      } else {
        const res = await api.post("/recurring", { ...body, isActive: activateNow });
        onSaved(res.data.recurring, true);
      }
      onClose();
    } catch (err) {
      setError(errorText(err, "خطا در ذخیره تراکنش تکرارشونده"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={editing ? "ویرایش تراکنش تکرارشونده" : "تراکنش تکرارشونده‌ی جدید"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* نوع */}
        <div>
          <label className={LABEL}>نوع</label>
          <div className="grid grid-cols-2 gap-2">
            {[["INCOME", "درآمد"], ["EXPENSE", "هزینه"]].map(([k, label]) => (
              <button
                key={k}
                type="button"
                disabled={!!editing}
                onClick={() => setType(k)}
                className={`${centered(type === k)} ${editing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          {editing && <p className={`${HINT} mt-1`}>نوع بعد از ساخت قابل تغییر نیست.</p>}
        </div>

        {/* عنوان */}
        <div>
          <label className={LABEL}>عنوان</label>
          <input
            type="text"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: اجاره‌ی خانه، حقوق"
            className={`${INPUT} text-right`}
          />
        </div>

        {/* مبلغ */}
        <div>
          <label className={LABEL}>مبلغ ({unit})</label>
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={formatAmountInput(amount)}
            onChange={(e) => setAmount(sanitizeDigits(e.target.value))}
            placeholder={unit === "تومان" ? "مبلغ را به تومان وارد کنید" : "مبلغ را به ریال وارد کنید"}
            className={`${INPUT} tracking-wider text-left`}
          />
        </div>

        {/* نوع تکرار */}
        <div>
          <label className={LABEL}>هر چند وقت یک‌بار؟</label>
          <div className="grid grid-cols-4 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFrequency(f.key)}
                className={`${centered(frequency === f.key)} !px-1`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* روز هفته */}
        {frequency === "WEEKLY" && (
          <div>
            <label className={LABEL}>روز هفته</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_CHIPS.map((d) => (
                <button key={d.v} type="button" onClick={() => setDayOfWeek(d.v)} className={chip(dayOfWeek === d.v)}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ماه (سالانه) */}
        {frequency === "YEARLY" && (
          <div>
            <label className={LABEL}>ماه</label>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonthOfYear(i + 1)}
                  className={`${centered(monthOfYear === i + 1)} !px-2`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* روز ماه (ماهانه / سالانه) */}
        {(frequency === "MONTHLY" || frequency === "YEARLY") && (
          <div>
            <label className={LABEL}>روز ماه</label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_MONTH.map((d) => (
                <button key={d} type="button" onClick={() => setDayOfMonth(d)} className={dayCell(dayOfMonth === d)}>
                  {toPersianNum(d)}
                </button>
              ))}
            </div>
            <p className={`${HINT} mt-1.5`}>
              اگر ماه آن روز را نداشت (مثلاً ۳۱ در ماه‌های ۳۰ روزه)، در آخرین روز همان ماه ثبت می‌شود.
            </p>
          </div>
        )}

        {/* خلاصه */}
        <div className="flex items-center gap-2 bg-[var(--brand-light)] rounded-xl px-3.5 py-2.5">
          <Repeat size={16} className="text-[color:var(--brand)] shrink-0" />
          <span className="text-xs font-semibold text-[color:var(--brand)]">{preview}</span>
        </div>

        {/* تاریخ شروع */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[color:var(--ink-light)]">تاریخ شروع (اختیاری)</label>
            {startDate && (
              <button type="button" onClick={() => setStartDate(null)} className="text-[11px] font-semibold text-[color:var(--danger)]">
                حذف
              </button>
            )}
          </div>
          <JalaliDatePicker value={startDate} onChange={setStartDate} placeholder="از همین الان" />
        </div>

        {/* تاریخ پایان */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[color:var(--ink-light)]">تاریخ پایان (اختیاری)</label>
            {endDate && (
              <button type="button" onClick={() => setEndDate(null)} className="text-[11px] font-semibold text-[color:var(--danger)]">
                حذف
              </button>
            )}
          </div>
          <JalaliDatePicker value={endDate} onChange={setEndDate} placeholder="بدون پایان" />
        </div>

        {/* دسته‌بندی — فقط هزینه */}
        {type === "EXPENSE" && categories.length > 0 && (
          <div>
            <label className={LABEL}>دسته‌بندی (اختیاری)</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setCategory(null)} className={chip(category === null)}>
                <span>🚫</span><span>بدون دسته</span>
              </button>
              {categories.map((c) => (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={chip(category === c.id)}>
                  <span>{c.icon}</span><span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* منبع درآمد — فقط درآمد */}
        {type === "INCOME" && incomeSources.length > 0 && (
          <div>
            <label className={LABEL}>منبع درآمد (اختیاری)</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setIncomeSourceId(null)} className={chip(incomeSourceId === null)}>
                <span>🚫</span><span>بدون منبع</span>
              </button>
              {incomeSources.map((s) => (
                <button key={s.id} type="button" onClick={() => setIncomeSourceId(s.id)} className={chip(incomeSourceId === s.id)}>
                  <span>{s.icon || "💰"}</span><span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* کارت */}
        {cards.length > 0 && (
          <div>
            <label className={LABEL}>کارت (اختیاری)</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setCardId(null)} className={chip(cardId === null)}>
                <span>🚫</span><span>بدون کارت</span>
              </button>
              {cards.map((c) => {
                const on = cardId === c._id;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setCardId(c._id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors"
                    style={{
                      backgroundColor: on ? c.color : "var(--input-bg)",
                      borderColor: on ? c.color : "var(--input-border)",
                      color: on ? "#fff" : "var(--ink-light)",
                    }}
                  >
                    <span>{c.icon}</span><span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* توضیحات */}
        <div>
          <label className={LABEL}>توضیحات (اختیاری)</label>
          <textarea
            rows={2}
            value={description}
            maxLength={300}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات تکمیلی..."
            className={`${INPUT} text-right resize-none`}
          />
        </div>

        {/* فعال‌سازی بلافاصله (فقط ساخت جدید) */}
        {!editing && (
          <div className="flex items-center gap-3 bg-[var(--bg)] border border-[color:var(--border)] rounded-xl px-3.5 py-3">
            <Toggle checked={activateNow} onChange={setActivateNow} label="بعد از ذخیره فعال شود" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-[color:var(--ink)] text-right">بعد از ذخیره فعال شود</p>
              <p className={`${HINT} mt-0.5`}>
                اگر خاموش باشد، فقط ساخته می‌شود و تا فعال نکنی چیزی ثبت نمی‌شود.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[var(--danger-light)] border border-[color:var(--danger-border)] rounded-xl px-4 py-3">
            <p className="text-xs text-[color:var(--danger)] text-right">{error}</p>
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {editing ? "ذخیره تغییرات" : "ساخت"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors"
          >
            انصراف
          </button>
        </div>
      </form>
    </Sheet>
  );
}
