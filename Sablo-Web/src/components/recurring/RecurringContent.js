"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Pencil, Trash2, Repeat, Plus } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { alertError } from "@/utils/apiError";
import { toPersianNum } from "@/utils/formatters";
import { scheduleText, formatJalaliFromIso } from "@/utils/recurring";
import PageShell from "@/components/shared/PageShell";
import Toggle from "@/components/shared/Toggle";
import RecurringFormSheet from "./RecurringFormSheet";

export default function RecurringContent() {
  const { display, unit } = useCurrency();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState(null); // در حال تغییر وضعیت (کلید فعال/غیرفعال)

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = ساخت جدید

  const fetchAll = useCallback(async () => {
    const [rec, cats, srcs] = await Promise.allSettled([
      api.get("/recurring"),
      api.get("/finance/categories"),
      api.get("/finance/income-sources"),
    ]);

    if (rec.status === "fulfilled") {
      setItems(rec.value.data?.recurring ?? []);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
    if (cats.status === "fulfilled") {
      const d = cats.value.data;
      setCategories(d?.categories ?? (Array.isArray(d) ? d : []));
    }
    if (srcs.status === "fulfilled") setIncomeSources(srcs.value.data?.incomeSources ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (r) => { setEditing(r); setFormOpen(true); };
  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSaved = useCallback((saved, isNew) => {
    setItems((prev) =>
      isNew ? [saved, ...prev] : prev.map((x) => (x._id === saved._id ? saved : x))
    );
  }, []);

  const handleToggle = async (r, next) => {
    if (busyId) return;
    setBusyId(r._id);
    try {
      const res = await api.patch(`/recurring/${r._id}/toggle`, { isActive: next });
      const updated = res.data.recurring;
      setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
    } catch (err) {
      alertError(err, "خطا در تغییر وضعیت");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(
      `«${r.title}» حذف شود؟\nتراکنش‌هایی که قبلاً ثبت شده‌اند حفظ می‌شوند و فقط ثبت خودکار از این به بعد متوقف می‌شود.`
    )) return;
    try {
      await api.delete(`/recurring/${r._id}`);
      setItems((prev) => prev.filter((x) => x._id !== r._id));
    } catch (err) {
      alertError(err, "خطا در حذف");
    }
  };

  const activeCount = items.filter((i) => i.isActive).length;

  return (
    <PageShell
      title="تراکنش‌های تکرارشونده"
      actionLabel="تکرارشونده‌ی جدید"
      onAction={loading || loadError ? undefined : openCreate}
    >
      <p className="text-xs leading-6 text-[color:var(--muted)] mb-5">
        درآمد یا هزینه‌ی ثابتت (مثل اجاره، حقوق یا قبض ماهانه) را یک‌بار تعریف کن تا در روز سررسید خودکار
        ثبت شود. برای گذشته چیزی ثبت نمی‌شود؛ اولین ثبت، اولین سررسید بعد از فعال‌سازی است.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[color:var(--brand)]" size={28} />
        </div>
      ) : loadError ? (
        <div className="text-center py-16">
          <p className="text-sm text-[color:var(--danger)] mb-3">دریافت تراکنش‌های تکرارشونده با خطا مواجه شد</p>
          <button
            onClick={() => { setLoading(true); fetchAll(); }}
            className="text-xs font-bold text-[color:var(--brand)]"
          >
            تلاش دوباره
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-sm font-bold mb-3">
            تکرارشونده‌های من
            {items.length > 0 && (
              <span className="text-xs font-medium text-[color:var(--muted)] mr-2">
                ({toPersianNum(activeCount)} فعال از {toPersianNum(items.length)})
              </span>
            )}
          </h2>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="w-16 h-16 bg-[var(--border)] rounded-full flex items-center justify-center">
                <Repeat size={28} className="text-[color:var(--muted)]" />
              </div>
              <p className="text-sm font-semibold">هنوز تراکنش تکرارشونده‌ای نساختی</p>
              <p className="text-xs text-[color:var(--muted)]">مثلاً «اجاره‌ی خانه» یا «حقوق ماهانه»</p>
              <button
                onClick={openCreate}
                className="mt-2 bg-[var(--brand)] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
              >
                ساخت اولین تکرارشونده
              </button>
            </div>
          ) : (
            <ul className="grid gap-2.5">
              {items.map((r) => {
                const isIncome = r.type === "INCOME";
                const emoji =
                  (isIncome ? r.incomeSourceInfo?.icon : r.categoryInfo?.icon) || (isIncome ? "💰" : "🧾");
                const extra = isIncome ? r.incomeSourceInfo?.label : r.categoryInfo?.label;

                return (
                  <li
                    key={r._id}
                    onClick={() => openEdit(r)}
                    className={`bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 cursor-pointer hover:bg-[var(--hover)] transition-colors ${
                      r.isActive ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isIncome ? "bg-[var(--emerald-bg)]" : "bg-[var(--rose-bg)]"
                        }`}
                      >
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{r.title}</p>
                        <p
                          className={`text-sm font-extrabold mt-0.5 ${
                            isIncome ? "text-[color:var(--emerald-text)]" : "text-[color:var(--rose-text)]"
                          }`}
                        >
                          {isIncome ? "+" : "−"} {display(r.amount)} {unit}
                        </p>
                        <p className="text-[11px] text-[color:var(--muted)] mt-0.5 truncate">
                          {scheduleText(r.frequency, r.dayOfWeek, r.dayOfMonth, r.monthOfYear)}
                          {extra ? `  ·  ${extra}` : ""}
                        </p>
                      </div>

                      {busyId === r._id ? (
                        <Loader2 size={20} className="animate-spin text-[color:var(--brand)] shrink-0" />
                      ) : (
                        <Toggle
                          checked={r.isActive}
                          onChange={(v) => handleToggle(r, v)}
                          label={r.isActive ? "غیرفعال کردن" : "فعال کردن"}
                        />
                      )}
                    </div>

                    <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-[color:var(--border)]">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span
                          className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            r.isActive
                              ? "bg-[var(--emerald-bg)] text-[color:var(--emerald-text)]"
                              : "bg-[var(--border)] text-[color:var(--muted)]"
                          }`}
                        >
                          {r.isActive ? "فعال" : "غیرفعال"}
                        </span>
                        {r.isActive && r.nextRunAt ? (
                          <span className="text-[11px] text-[color:var(--muted)]">
                            سررسید بعدی: {formatJalaliFromIso(r.nextRunAt)}
                          </span>
                        ) : null}
                        {r.runCount > 0 ? (
                          <span className="text-[11px] text-[color:var(--muted)]">
                            {toPersianNum(r.runCount)} بار ثبت شده
                          </span>
                        ) : null}
                        {r.endDate ? (
                          <span className="text-[11px] text-[color:var(--muted)]">
                            تا {formatJalaliFromIso(r.endDate)}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(r); }}
                          aria-label={`ویرایش ${r.title}`}
                          className="p-2 rounded-lg text-[color:var(--info)] hover:bg-[var(--info-light)] transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(r); }}
                          aria-label={`حذف ${r.title}`}
                          className="p-2 rounded-lg text-[color:var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && (
            <button
              onClick={openCreate}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[color:var(--border)] py-3 text-sm font-bold text-[color:var(--brand)] hover:bg-[var(--brand-light)] transition-colors"
            >
              <Plus size={18} /> تراکنش تکرارشونده‌ی جدید
            </button>
          )}
        </>
      )}

      <RecurringFormSheet
        isOpen={formOpen}
        onClose={closeForm}
        editing={editing}
        categories={categories}
        incomeSources={incomeSources}
        onSaved={handleSaved}
      />
    </PageShell>
  );
}
