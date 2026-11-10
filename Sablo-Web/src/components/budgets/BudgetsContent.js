"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, ChevronRight, ChevronLeft, Trash2, PiggyBank, Plus } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { alertError, errorText } from "@/utils/apiError";
import { toPersianNum, sanitizeDigits, formatAmountInput } from "@/utils/formatters";
import PageShell from "@/components/shared/PageShell";
import Sheet, { LABEL, HINT, INPUT, chip } from "@/components/shared/Sheet";

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

// دسته‌هایی که «درآمد» هستند و بودجه‌ی هزینه برایشان معنی ندارد
const INCOME_CATEGORY_IDS = ["salary", "freelance"];

const barColor = (pct) =>
  pct >= 100 ? "var(--danger)" : pct >= 80 ? "var(--warning)" : "var(--brand)";

export default function BudgetsContent() {
  const { currency, display, unit } = useCurrency();

  // null = ماه جاری (سرور تشخیص می‌دهد)
  const [requestedMonth, setRequestedMonth] = useState(null);
  const [month, setMonth] = useState(null); // { jy, jm }
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [limitText, setLimitText] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const reqRef = useRef(0);

  const fetchBudgets = useCallback(async () => {
    const myReq = ++reqRef.current;
    try {
      const params = requestedMonth ? { jy: requestedMonth.jy, jm: requestedMonth.jm } : undefined;
      const res = await api.get("/budgets", { params });
      if (myReq !== reqRef.current) return; // پاسخ کهنه (کاربر سریع ماه را عوض کرده)
      setMonth({ jy: res.data.jy, jm: res.data.jm });
      setBudgets(res.data.budgets ?? []);
    } catch (err) {
      if (myReq === reqRef.current) alertError(err, "خطا در دریافت بودجه‌ها");
    } finally {
      if (myReq === reqRef.current) setLoading(false);
    }
  }, [requestedMonth]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  useEffect(() => {
    api.get("/finance/categories")
      .then((res) => setCategories(res.data.categories ?? []))
      .catch(() => {});
  }, []);

  // ── ناوبری ماه: در RTL فلش راست = ماه بعد (مثل MonthSelector گزارش‌ها) ──
  const shiftMonth = (delta) => {
    if (!month) return;
    let jy = month.jy;
    let jm = month.jm + delta;
    if (jm > 12) { jm = 1; jy += 1; }
    if (jm < 1) { jm = 12; jy -= 1; }
    setLoading(true);
    setRequestedMonth({ jy, jm });
  };

  // کاربر به واحد نمایشی وارد می‌کند، سرور ریال نگه می‌دارد
  const toRial = (n) => (currency === "IRT" ? n * 10 : n);
  const fromRial = (n) => (currency === "IRT" ? Math.round(n / 10) : n);

  const limitNumber = Number(limitText || 0);

  const budgetedIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = categories.filter(
    (c) => !INCOME_CATEGORY_IDS.includes(c.id) && !budgetedIds.has(c.id)
  );

  const openCreate = () => {
    setEditing(null); setCategoryId(null); setLimitText(""); setFormError(null); setFormOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b); setCategoryId(b.categoryId); setLimitText(String(fromRial(b.limit)));
    setFormError(null); setFormOpen(true);
  };

  const closeForm = useCallback(() => { if (!formLoading) setFormOpen(false); }, [formLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formLoading || !month) return;
    if (!categoryId) return setFormError("یک دسته‌بندی انتخاب کنید");
    if (!limitNumber || limitNumber <= 0) return setFormError("سقف بودجه را وارد کنید");

    setFormLoading(true);
    setFormError(null);
    try {
      await api.put("/budgets", {
        categoryId,
        limit: toRial(limitNumber),
        jy: month.jy,
        jm: month.jm,
      });
      setFormOpen(false);
      await fetchBudgets();
    } catch (err) {
      setFormError(errorText(err, "خطا در ذخیره بودجه"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`بودجه‌ی «${b.label}» حذف شود؟`)) return;
    try {
      await api.delete(`/budgets/${b.id}`);
      setBudgets((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err) {
      alertError(err, "خطا در حذف بودجه");
    }
  };

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const monthTitle = month ? `${MONTH_NAMES[month.jm - 1]} ${toPersianNum(month.jy)}` : "";

  if (loading && !month) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[color:var(--brand)]" size={28} />
      </div>
    );
  }

  return (
    <PageShell title="بودجه‌بندی" actionLabel="بودجه جدید" onAction={loading ? undefined : openCreate}>
      {/* انتخاب ماه */}
      <div className="flex items-center justify-between bg-[var(--card)] rounded-2xl border border-[color:var(--border)] px-3 py-2 mb-4">
        <button
          onClick={() => shiftMonth(1)}
          aria-label="ماه بعد"
          className="p-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <span className="text-sm font-extrabold">{monthTitle}</span>
        <button
          onClick={() => shiftMonth(-1)}
          aria-label="ماه قبل"
          className="p-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[color:var(--brand)]" size={28} />
        </div>
      ) : (
        <>
          {/* خلاصه */}
          {budgets.length > 0 && (
            <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-4">
              <p className="text-[11px] text-[color:var(--muted)] mb-1">مصرف کل بودجه‌ها</p>
              <p className="text-sm font-extrabold mb-3">
                {display(totalSpent)} از {display(totalLimit)} {unit}
              </p>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(totalPct, 100)}%`, background: barColor(totalPct) }}
                />
              </div>
              <p className="text-[11px] text-[color:var(--muted)] mt-2">{toPersianNum(totalPct)}٪ مصرف شده</p>
            </div>
          )}

          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="w-16 h-16 bg-[var(--border)] rounded-full flex items-center justify-center">
                <PiggyBank size={28} className="text-[color:var(--muted)]" />
              </div>
              <p className="text-sm font-semibold">برای این ماه بودجه‌ای تعیین نکرده‌ای</p>
              <p className="text-xs text-[color:var(--muted)] max-w-xs leading-6">
                برای هر دسته یک سقف ماهانه بگذار تا ببینی چقدر از آن را مصرف کرده‌ای.
              </p>
              <button
                onClick={openCreate}
                className="mt-2 bg-[var(--brand)] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
              >
                ثبت اولین بودجه
              </button>
            </div>
          ) : (
            <ul className="grid gap-3">
              {budgets.map((b) => {
                const over = b.spent > b.limit;
                const color = barColor(b.percentage);
                return (
                  <li key={b.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openEdit(b)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEdit(b); } }}
                      className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 cursor-pointer hover:bg-[var(--hover)] transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl">{b.icon || "🏷️"}</span>
                          <span className="text-sm font-bold truncate">{b.label}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(b); }}
                          aria-label={`حذف بودجه ${b.label}`}
                          className="p-2 rounded-lg text-[color:var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-2">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(b.percentage, 100)}%`, background: color }} />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[color:var(--muted)]">
                          {display(b.spent)} از {display(b.limit)} {unit}
                        </span>
                        <span className="font-extrabold" style={{ color }}>{toPersianNum(b.percentage)}٪</span>
                      </div>
                      <p className={`text-[11px] mt-1 ${over ? "text-[color:var(--danger)] font-semibold" : "text-[color:var(--muted)]"}`}>
                        {over
                          ? `${display(b.spent - b.limit)} ${unit} بیشتر از سقف`
                          : `${display(b.remaining)} ${unit} باقی مانده`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {budgets.length > 0 && (
            <button
              onClick={openCreate}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[color:var(--border)] py-3 text-sm font-bold text-[color:var(--brand)] hover:bg-[var(--brand-light)] transition-colors"
            >
              <Plus size={18} /> بودجه جدید
            </button>
          )}
        </>
      )}

      <Sheet
        isOpen={formOpen}
        onClose={closeForm}
        title={editing ? `ویرایش بودجه‌ی ${editing.label}` : `بودجه‌ی جدید برای ${monthTitle}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className={LABEL}>دسته‌بندی</label>
              {availableCategories.length === 0 ? (
                <p className={HINT}>برای همه‌ی دسته‌ها بودجه تعیین شده است.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {availableCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      aria-pressed={categoryId === c.id}
                      className={chip(categoryId === c.id)}
                    >
                      <span>{c.icon}</span>{c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="budget-limit">سقف ماهانه ({unit})</label>
            <input
              id="budget-limit"
              type="text"
              inputMode="numeric"
              dir="ltr"
              maxLength={21}
              placeholder="مثلاً 2,000,000"
              value={formatAmountInput(limitText)}
              onChange={(e) => setLimitText(sanitizeDigits(e.target.value).slice(0, 15))}
              className={`${INPUT} text-left tracking-wider`}
            />
            {limitNumber > 0 && (
              <p className={`${HINT} mt-1`}>{toPersianNum(limitNumber.toLocaleString("en-US"))} {unit}</p>
            )}
          </div>

          {formError && (
            <div className="bg-[var(--danger-light)] border border-[color:var(--danger-border)] rounded-xl px-4 py-3">
              <p className="text-xs text-[color:var(--danger)] text-right">{formError}</p>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              {editing ? "ذخیره تغییرات" : "ثبت بودجه"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </Sheet>
    </PageShell>
  );
}
