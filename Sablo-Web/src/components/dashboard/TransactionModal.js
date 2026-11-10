"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { useCurrency } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext";
import { useTheme } from "@/context/themeContext";
import { alertError } from "@/utils/apiError";

const TYPE_VARIANTS = [
  { key: "INCOME", label: "درآمد" },
  { key: "EXPENSE", label: "خرج" },
  { key: "INSTALLMENT", label: "قسط شخصی" },
];

const formatAmount = (value) => {
  if (value === null || value === undefined) return "";
  const digitsOnly = String(value).replace(/[^\d]/g, "");
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("en-US");
};

const unformatAmount = (value) => {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};

/* ── کلاس‌های مشترک (همه از توکن‌های تم) ── */
const LABEL = "block text-xs font-medium text-[color:var(--ink-light)] mb-1.5 text-right";
const HINT = "text-[10px] text-[color:var(--muted)] mt-1 text-right";
const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]";
const chip = (active) =>
  `flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[11px] font-semibold transition-colors ${
    active
      ? "bg-[var(--brand)] border-[color:var(--brand)] text-white"
      : "bg-[var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--muted)] hover:bg-[var(--border)]"
  }`;

export default function TransactionModal({
  isOpen, onClose, onRefreshData,
  editingTransaction, categories = [],
  onCreateCategory, categoryFormLoading = false,
}) {
  const isEditMode = Boolean(editingTransaction);
  const { currency } = useCurrency();
  const { mode } = useTheme();
  const unitLabel = currency === "IRT" ? "تومان" : "ریال";
  const pickerClass = mode === "dark" ? "bg-dark" : "";

  const { activeCard, cards: contextCards } = useCard();

  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [category, setCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // ── منابع درآمد ──
  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeSourceId, setIncomeSourceId] = useState(null);
  const [showNewSrc, setShowNewSrc] = useState(false);
  const [newSrcLabel, setNewSrcLabel] = useState("");
  const [newSrcIcon, setNewSrcIcon] = useState("");
  const [newSrcError, setNewSrcError] = useState(null);
  const [srcFormLoading, setSrcFormLoading] = useState(false);

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [newCatError, setNewCatError] = useState(null);

  const openNewCat = () => { setNewCatLabel(""); setNewCatIcon(""); setNewCatError(null); setShowNewCat(true); };
  const closeNewCat = () => { setShowNewCat(false); setNewCatError(null); };

  const submitNewCat = async () => {
    if (!onCreateCategory) return;
    const label = newCatLabel.trim();
    if (!label) { setNewCatError("نام دسته‌بندی را وارد کنید"); return; }
    setNewCatError(null);
    const result = await onCreateCategory(label, newCatIcon.trim());
    if (result.success) { setCategory(result.category.id); closeNewCat(); }
    else setNewCatError(result.message);
  };

  const closeNewSrc = () => { setShowNewSrc(false); setNewSrcError(null); };

  const submitNewSrc = async () => {
    const label = newSrcLabel.trim();
    if (!label) { setNewSrcError("نام منبع درآمد را وارد کنید"); return; }
    setNewSrcError(null);
    setSrcFormLoading(true);
    try {
      const res = await api.post("/finance/income-sources", { label, icon: newSrcIcon.trim() });
      const created = res.data.incomeSource;
      setIncomeSources((prev) => [...prev, created]);
      setIncomeSourceId(created.id);
      setNewSrcLabel(""); setNewSrcIcon(""); setShowNewSrc(false);
    } catch (error) {
      setNewSrcError(error?.response?.data?.message || "خطا در ساخت منبع درآمد");
    } finally {
      setSrcFormLoading(false);
    }
  };

  // هر بار که مودال باز می‌شود لیست منابع درآمد تازه گرفته می‌شود
  // (منابعی که در صفحهٔ «منابع درآمد» ساخته شده‌اند هم نمایش داده شوند)
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    api.get("/finance/income-sources")
      .then((res) => { if (!cancelled) setIncomeSources(res.data.incomeSources ?? []); })
      .catch(() => { if (!cancelled) setIncomeSources([]); });
    return () => { cancelled = true; };
  }, [isOpen]);

  // ── ریست / پر کردن فرم ──
  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      const displayAmount = currency === "IRT"
        ? Math.round(editingTransaction.amount / 10)
        : editingTransaction.amount;
      setAmount(formatAmount(displayAmount));
      setTitle(editingTransaction.title ?? "");
      setDescription(editingTransaction.description ?? "");
      setDueDate(editingTransaction.dueDate ? new Date(editingTransaction.dueDate) : "");
      setTransactionDate("");
      setCategory(editingTransaction.category ?? null);
      setIncomeSourceId(editingTransaction.incomeSourceId ?? null);
      setSelectedCardId(editingTransaction.cardId ?? null);
    } else {
      setType("EXPENSE"); setAmount(""); setTitle("");
      setDescription(""); setDueDate(""); setTransactionDate("");
      setCategory(null);
      setIncomeSourceId(null);
      setSelectedCardId(activeCard?._id ?? null);
    }
    setShowNewCat(false);
    setShowNewSrc(false);
  }, [isOpen, editingTransaction, activeCard]);

  if (!isOpen) return null;

  const handleAmountChange = (e) => setAmount(formatAmount(e.target.value));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = unformatAmount(amount);
    if (!numericAmount || !title.trim()) {
      alert("لطفاً عنوان و مبلغ را وارد کنید");
      return;
    }
    const amountInRial = currency === "IRT" ? numericAmount * 10 : numericAmount;
    setFormLoading(true);
    try {
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;
      const formattedTransactionDate = transactionDate ? new Date(transactionDate).toISOString() : undefined;

      const payload = {
        amount: amountInRial,
        title,
        description,
        category: type === "EXPENSE" ? category : undefined,
        // null = «بدون منبع» (در ویرایش، منبع قبلی را پاک می‌کند)
        incomeSourceId: type === "INCOME" ? (incomeSourceId ?? null) : undefined,
        dueDate: type === "INSTALLMENT" ? formattedDueDate : undefined,
        cardId: selectedCardId ?? null,
      };

      if (isEditMode) {
        await api.put(`/finance/update/${editingTransaction._id}`, payload);
      } else {
        await api.post("/finance/add", {
          type,
          ...payload,
          ...(formattedTransactionDate && { date: formattedTransactionDate }),
        });
      }
      onClose();
      onRefreshData();
    } catch (error) {
      alertError(error, "خطایی رخ داد");
    } finally {
      setFormLoading(false);
    }
  };

  const showCategorySection = type === "EXPENSE" && (categories.length > 0 || onCreateCategory);

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50">
      {/* استایل فیلد تاریخ — از توکن‌های تم */}
      <style>{`
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: var(--input-bg) !important; color: var(--ink) !important; border: 1px solid var(--input-border) !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; }
        .rmdp-input:focus { border-color: var(--brand) !important; box-shadow: none !important; }
        .rmdp-input::placeholder { color: var(--muted-light); }
      `}</style>

      <div className="bg-[var(--card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 border border-[color:var(--border)] shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-4 sm:hidden" />
        <h3 className="text-base font-bold text-[color:var(--ink)] mb-4 text-right">
          {isEditMode ? "ویرایش تراکنش" : "ثبت تراکنش هوشمند"}
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">

          {/* نوع تراکنش */}
          <div>
            <label className={LABEL}>نوع تراکنش</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_VARIANTS.map((item) => (
                <button key={item.key} type="button" disabled={isEditMode}
                  onClick={() => { setType(item.key); setCategory(null); setIncomeSourceId(null); setShowNewCat(false); setShowNewSrc(false); }}
                  className={`py-2 text-[11px] font-semibold rounded-xl border transition-all ${
                    type === item.key
                      ? "bg-[var(--brand)] text-white border-[color:var(--brand)]"
                      : "bg-[var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--ink-light)]"
                  } ${isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {item.label}
                </button>
              ))}
            </div>
            {isEditMode && <p className={`${HINT} mt-1.5`}>نوع تراکنش پس از ثبت قابل تغییر نیست.</p>}
          </div>

          {/* عنوان */}
          <div>
            <label className={LABEL}>عنوان</label>
            <input type="text" placeholder="مثال: حقوق، خرید، وام مسکن"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className={`${INPUT} text-right`} />
          </div>

          {/* مبلغ */}
          <div>
            <label className={LABEL}>مبلغ ({unitLabel})</label>
            <input type="text" inputMode="numeric" placeholder={`مبلغ را به ${unitLabel} وارد کنید`}
              value={amount} onChange={handleAmountChange} dir="ltr"
              className={`${INPUT} tracking-wider text-left`} />
            <p className={HINT}>
              {currency === "IRT" ? "مبلغ را به تومان وارد کنید" : "مبلغ را به ریال وارد کنید"}
            </p>
          </div>

          {/* تاریخ تراکنش */}
          {!isEditMode && (
            <div>
              <label className={LABEL}>تاریخ تراکنش</label>
              <div className="flex flex-row-reverse gap-2 items-start">
                <button type="button" onClick={() => setTransactionDate("")}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                    !transactionDate
                      ? "bg-[var(--brand)] border-[color:var(--brand)] text-white"
                      : "bg-[var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--muted)] hover:bg-[var(--border)]"
                  }`}>
                  امروز
                </button>
                <div className="flex-1">
                  <DatePicker className={pickerClass} calendar={persian} locale={persian_fa} value={transactionDate}
                    onChange={(d) => setTransactionDate(d?.isValid ? d.toDate() : "")}
                    calendarPosition="bottom-right" placeholder="یا یک تاریخ دیگر انتخاب کن" />
                </div>
              </div>
              <p className={HINT}>برای تراکنش‌های قدیمی می‌تونی تاریخ واقعی‌شون رو انتخاب کنی</p>
            </div>
          )}

          {/* دسته‌بندی */}
          {showCategorySection && (
            <div>
              <label className={LABEL}>دسته‌بندی (اختیاری)</label>
              <div className="flex flex-row-reverse gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {onCreateCategory && (
                  <button type="button" onClick={() => (showNewCat ? closeNewCat() : openNewCat())}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold border-2 border-dashed border-[color:var(--brand)] text-[color:var(--brand)] transition-colors hover:bg-[var(--brand-light)] ${
                      showNewCat ? "bg-[var(--brand-light)]" : ""
                    }`}>
                    <span>➕</span><span>دسته‌بندی جدید</span>
                  </button>
                )}
                <button type="button" onClick={() => setCategory(null)} className={chip(category === null)}>
                  <span>🚫</span><span>بدون دسته</span>
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={chip(category === cat.id)}>
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {showNewCat && (
                <div className="mt-3 bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-2xl p-4 space-y-3">
                  <div className="flex flex-row-reverse gap-2 items-center">
                    <input type="text" placeholder="🙂" maxLength={4} value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-14 text-center text-lg bg-[var(--card)] border border-[color:var(--input-border)] rounded-xl py-2 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)]" />
                    <input type="text" placeholder="مثال: گازوئیل" maxLength={30} value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitNewCat())}
                      className="flex-1 text-sm text-right bg-[var(--card)] border border-[color:var(--input-border)] rounded-xl px-3 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]" />
                  </div>
                  {newCatError && <p className="text-[11px] text-[color:var(--danger)] text-right">{newCatError}</p>}
                  <div className="flex flex-row-reverse gap-2">
                    <button type="button" onClick={submitNewCat} disabled={categoryFormLoading}
                      className="flex-1 bg-[var(--brand)] disabled:opacity-70 text-white text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5">
                      {categoryFormLoading ? <Loader2 size={13} className="animate-spin" /> : "افزودن"}
                    </button>
                    <button type="button" onClick={closeNewCat}
                      className="bg-[var(--card)] border border-[color:var(--input-border)] text-[color:var(--muted)] text-xs font-semibold rounded-xl px-4 py-2.5">
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* منبع درآمد */}
          {type === "INCOME" && (
            <div>
              <label className={LABEL}>منبع درآمد (اختیاری)</label>
              <div className="flex flex-row-reverse gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button type="button" onClick={() => (showNewSrc ? closeNewSrc() : setShowNewSrc(true))}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold border-2 border-dashed border-[color:var(--brand)] text-[color:var(--brand)] transition-colors hover:bg-[var(--brand-light)] ${
                    showNewSrc ? "bg-[var(--brand-light)]" : ""
                  }`}>
                  <span>➕</span><span>منبع جدید</span>
                </button>
                <button type="button" onClick={() => setIncomeSourceId(null)} className={chip(incomeSourceId === null)}>
                  <span>🚫</span><span>بدون منبع</span>
                </button>
                {incomeSources.map((src) => (
                  <button key={src.id} type="button" onClick={() => setIncomeSourceId(src.id)} className={chip(incomeSourceId === src.id)}>
                    {src.icon && <span>{src.icon}</span>}
                    <span>{src.label}</span>
                  </button>
                ))}
              </div>

              {showNewSrc && (
                <div className="mt-3 bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-2xl p-4 space-y-3">
                  <div className="flex flex-row-reverse gap-2 items-center">
                    <input type="text" placeholder="💰" maxLength={4} value={newSrcIcon}
                      onChange={(e) => setNewSrcIcon(e.target.value)}
                      className="w-14 text-center text-lg bg-[var(--card)] border border-[color:var(--input-border)] rounded-xl py-2 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)]" />
                    <input type="text" placeholder="مثال: حقوق شرکت" maxLength={30} value={newSrcLabel}
                      onChange={(e) => setNewSrcLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitNewSrc())}
                      className="flex-1 text-sm text-right bg-[var(--card)] border border-[color:var(--input-border)] rounded-xl px-3 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]" />
                  </div>
                  {newSrcError && <p className="text-[11px] text-[color:var(--danger)] text-right">{newSrcError}</p>}
                  <div className="flex flex-row-reverse gap-2">
                    <button type="button" onClick={submitNewSrc} disabled={srcFormLoading}
                      className="flex-1 bg-[var(--brand)] disabled:opacity-70 text-white text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5">
                      {srcFormLoading ? <Loader2 size={13} className="animate-spin" /> : "افزودن"}
                    </button>
                    <button type="button" onClick={closeNewSrc}
                      className="bg-[var(--card)] border border-[color:var(--input-border)] text-[color:var(--muted)] text-xs font-semibold rounded-xl px-4 py-2.5">
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* انتخاب کارت */}
          {contextCards.length > 0 && (
            <div>
              <label className={LABEL}>کارت (اختیاری)</label>
              <div className="flex flex-row-reverse gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button type="button" onClick={() => setSelectedCardId(null)} className={chip(selectedCardId === null)}>
                  <span>🚫</span><span>بدون کارت</span>
                </button>
                {contextCards.map((card) => {
                  const isSelected = selectedCardId === card._id;
                  return (
                    <button key={card._id} type="button" onClick={() => setSelectedCardId(card._id)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[11px] font-semibold transition-all"
                      style={{
                        backgroundColor: isSelected ? card.color : "var(--input-bg)",
                        borderColor: isSelected ? card.color : "var(--input-border)",
                        color: isSelected ? "#fff" : "var(--muted)",
                      }}>
                      <span>{card.icon}</span>
                      <span>{card.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* تاریخ سررسید */}
          {type === "INSTALLMENT" && (
            <div>
              <label className="block text-xs font-medium text-[color:var(--amber-text)] mb-1.5 text-right">
                تاریخ سررسید (شمسی)
              </label>
              <DatePicker className={pickerClass} calendar={persian} locale={persian_fa} value={dueDate}
                onChange={(d) => setDueDate(d?.isValid ? d.toDate() : "")}
                calendarPosition="bottom-right" placeholder="انتخاب تاریخ سررسید" />
            </div>
          )}

          {/* توضیحات */}
          <div>
            <label className={LABEL}>توضیحات (اختیاری)</label>
            <textarea rows={2} placeholder="توضیحات تکمیلی..." value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${INPUT} text-right resize-none`} />
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-2.5 pt-1">
            <button type="submit" disabled={formLoading}
              className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors">
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              {isEditMode ? "بروزرسانی تراکنش" : "ذخیره تراکنش"}
            </button>
            <button type="button" onClick={onClose}
              className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors">
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}