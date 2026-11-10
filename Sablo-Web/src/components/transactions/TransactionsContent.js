"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, Calendar, Download, CheckCircle,
  Eye, Pencil, Trash2, ChevronRight, ChevronLeft, ArrowRight, Loader2
} from "lucide-react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext";
import { useTheme } from "@/context/themeContext";
import TransactionModal       from "@/components/dashboard/TransactionModal";
import TransactionDetailModal from "@/components/dashboard/TransactionDetailModal";
import PayInstallmentModal    from "@/components/dashboard/PayInstallmentModal";
import { alertError } from "@/utils/apiError";

const TYPE_LABELS = { INCOME: "درآمد", EXPENSE: "خرج", INSTALLMENT: "قسط", LOAN: "وام", TRANSFER_IN: "دریافت", TRANSFER_OUT: "انتقال" };

// رنگ هر نوع تراکنش از متغیرهای تم (success / danger / warning / info)
const TYPE_COLORS = {
  INCOME:
    "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[color:var(--success)] border-[color-mix(in_srgb,var(--success)_25%,transparent)]",
  EXPENSE:
    "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[color:var(--danger)] border-[color-mix(in_srgb,var(--danger)_25%,transparent)]",
  INSTALLMENT:
    "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[color:var(--warning)] border-[color-mix(in_srgb,var(--warning)_25%,transparent)]",
  LOAN:
    "bg-[color-mix(in_srgb,var(--info)_12%,transparent)] text-[color:var(--info)] border-[color-mix(in_srgb,var(--info)_25%,transparent)]",
  TRANSFER_IN:
    "bg-[color-mix(in_srgb,var(--transfer-in)_12%,transparent)] text-[color:var(--transfer-in)] border-[color-mix(in_srgb,var(--transfer-in)_25%,transparent)]",
  TRANSFER_OUT:
    "bg-[color-mix(in_srgb,var(--transfer-out)_12%,transparent)] text-[color:var(--transfer-out)] border-[color-mix(in_srgb,var(--transfer-out)_25%,transparent)]",
};

const AMOUNT_COLORS = {
  TRANSFER_IN: "text-[color:var(--transfer-in)]",
  TRANSFER_OUT: "text-[color:var(--transfer-out)]",
};

const ICON_BTN = "w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--hover)] transition-colors";
const PAGE_ARROW =
  "w-9 h-9 rounded-xl border border-[color:var(--border)] bg-[var(--card)] text-[color:var(--ink)] flex items-center justify-center disabled:opacity-30 hover:bg-[var(--hover)] transition-colors";

function formatJalali(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("fa-IR"); } catch { return ""; }
}

function toISODate(val) {
  if (!val) return "";
  try { return new Date(val).toISOString().split("T")[0]; } catch { return ""; }
}

function buildPageList(current, total) {
  const SIBLINGS = 1;
  if (total <= 5 + SIBLINGS * 2) return Array.from({ length: total }, (_, i) => i + 1);
  const left  = Math.max(current - SIBLINGS, 2);
  const right = Math.min(current + SIBLINGS, total - 1);
  const pages = [1];
  if (left  > 2)         pages.push("dots-start");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("dots-end");
  pages.push(total);
  return pages;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(currentPage, totalPages);
  const goTo  = (p) => { if (p >= 1 && p <= totalPages && p !== currentPage) onPageChange(p); };
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-[color:var(--border)] mt-4">
      <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}
        aria-label="صفحه قبل" className={PAGE_ARROW}>
        <ChevronRight size={17} />
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "dots-start" || p === "dots-end" ? (
            <span key={`${p}-${i}`} className="w-8 text-center text-sm text-[color:var(--muted)]">···</span>
          ) : (
            <button key={p} onClick={() => goTo(p)} disabled={p === currentPage}
              className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                p === currentPage
                  ? "bg-[var(--brand)] border-[color:var(--brand)] text-white"
                  : "bg-[var(--card)] border-[color:var(--border)] text-[color:var(--ink)] hover:bg-[var(--hover)]"
              }`}>
              {p}
            </button>
          )
        )}
      </div>
      <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= totalPages}
        aria-label="صفحه بعد" className={PAGE_ARROW}>
        <ChevronLeft size={17} />
      </button>
    </div>
  );
}

function TxRow({ tx, onPay, onView, onEdit, onDelete, display, unit }) {
  const isPositive = tx.type === "INCOME" || tx.type === "LOAN" || tx.type === "TRANSFER_IN";
  return (
    <div className="py-3.5 border-b border-[color:var(--border)] last:border-0">
      <div className="flex flex-row-reverse items-start gap-3">
        <div className={`shrink-0 w-12 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold border ${TYPE_COLORS[tx.type]}`}>
          {TYPE_LABELS[tx.type]}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-sm font-semibold text-[color:var(--ink)] truncate">{tx.title}</p>
          {tx.description && (
            <p className="text-xs text-[color:var(--muted)] mt-0.5 line-clamp-2">{tx.description}</p>
          )}
          {tx.categoryInfo && (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[color:var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">
              {tx.categoryInfo.icon && <span>{tx.categoryInfo.icon}</span>}
              {tx.categoryInfo.label}
            </span>
          )}
          {tx.dueDate && tx.type === "INSTALLMENT" && !tx.isPaid && (
            <span className="inline-block mt-1 text-[10px] text-[color:var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] px-2 py-0.5 rounded-full">
              سررسید: {formatJalali(tx.dueDate)}
            </span>
          )}
        </div>
        <div className="shrink-0 text-left">
          <p className={`text-base font-extrabold ${AMOUNT_COLORS[tx.type] ?? (isPositive ? "text-[color:var(--success)]" : "text-[color:var(--danger)]")}`}>
            {isPositive ? "+" : "-"}{display(tx.amount)}
          </p>
          <p className="text-[11px] text-[color:var(--muted)] font-medium">{unit}</p>
          <p className="text-[10px] text-[color:var(--muted-light)] mt-0.5">{formatJalali(tx.date)}</p>
        </div>
      </div>
      <div className="flex flex-row-reverse items-center justify-between mt-2.5">
        <div>
          {tx.type === "INSTALLMENT" && !tx.isPaid && (
            <button onClick={() => onPay(tx._id)}
              className="flex items-center gap-1 text-[10px] font-semibold text-[color:var(--success)] bg-[var(--success-light)] px-2.5 py-1 rounded-lg hover:bg-[color-mix(in_srgb,var(--success)_22%,transparent)] transition-colors">
              <CheckCircle size={11} /> پرداخت
            </button>
          )}
          {tx.type === "INSTALLMENT" && tx.isPaid && (
            <span className="flex items-center gap-1 text-[10px] text-[color:var(--success)]">
              <CheckCircle size={11} /> پرداخت شده
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(tx)} aria-label="مشاهده" className={ICON_BTN}>
            <Eye size={14} className="text-[color:var(--muted)]" />
          </button>
          {tx.type !== "TRANSFER_IN" && tx.type !== "TRANSFER_OUT" && (
            <button onClick={() => onEdit(tx)} aria-label="ویرایش" className={ICON_BTN}>
              <Pencil size={14} className="text-[color:var(--muted)]" />
            </button>
          )}
          <button onClick={() => onDelete(tx)} aria-label="حذف"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--danger-light)] transition-colors">
            <Trash2 size={14} className="text-[color:var(--danger)]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsContent() {
  const router = useRouter();
  const { display, unit } = useCurrency();
  const { activeCard, cards } = useCard();
  const { mode } = useTheme();

  const [transactions,         setTransactions]         = useState([]);
  const [loading,              setLoading]              = useState(true);
  const [downloading,          setDownloading]          = useState(false);
  const [currentPage,          setCurrentPage]          = useState(1);
  const [totalPages,           setTotalPages]           = useState(1);
  const [totalItems,           setTotalItems]           = useState(0);
  const [searchQuery,          setSearchQuery]          = useState("");
  const [fromDate,             setFromDate]             = useState(null);
  const [toDate,               setToDate]               = useState(null);
  const [showDateFilter,       setShowDateFilter]       = useState(false);
  const [selectedTx,           setSelectedTx]           = useState(null);
  const [editingTx,            setEditingTx]            = useState(null);
  const [isModalOpen,          setIsModalOpen]          = useState(false);
  const [categories,           setCategories]           = useState([]);
  const [categoryFormLoading,  setCategoryFormLoading]  = useState(false);

  // ── state مودال پرداخت قسط ──
  const [payModalVisible,      setPayModalVisible]      = useState(false);
  const [pendingInstallmentId, setPendingInstallmentId] = useState(null);

  const searchTimeoutRef = useRef(null);
  const hasDateFilter    = Boolean(fromDate || toDate);
  const pickerClass      = mode === "dark" ? "bg-dark" : "";

  // ── fetch ──
  const fetchTransactions = useCallback(async (page = 1, search = "", from = null, to = null) => {
    try {
      const params = { page, limit: 20 };
      if (search)     params.search = search;
      if (from)       params.from   = toISODate(from);
      if (to)         params.to     = toISODate(to);
      if (activeCard) params.cardId = activeCard._id;
      const res = await api.get("/finance/my-data", { params });
      setTransactions(res.data.transactions ?? []);
      setCurrentPage(res.data.currentPage ?? 1);
      setTotalPages(res.data.totalPages ?? 1);
      setTotalItems(res.data.totalItems ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCard]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/finance/categories");
      setCategories(res.data.categories ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTransactions(1, "", null, null);
    fetchCategories();
  }, []); // eslint-disable-line

  useEffect(() => {
    setCurrentPage(1);
    fetchTransactions(1, searchQuery, fromDate, toDate);
  }, [activeCard]); // eslint-disable-line

  const createCustomCategory = useCallback(async (label, icon) => {
    setCategoryFormLoading(true);
    try {
      const res = await api.post("/finance/categories/custom", { label, icon });
      const newCat = res.data.category;
      setCategories((prev) => [...prev, newCat]);
      return { success: true, category: newCat };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "خطا در ساخت دسته‌بندی" };
    } finally {
      setCategoryFormLoading(false);
    }
  }, []);

  const handleDownloadCSV = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (fromDate)    params.append("from", toISODate(fromDate));
      if (toDate)      params.append("to",   toISODate(toDate));
      if (activeCard)  params.append("cardId", activeCard._id);
      const res = await api.get(
        `/finance/export-csv${params.toString() ? "?" + params.toString() : ""}`,
        { responseType: "text", transformResponse: [(d) => d] }
      );
      const csvText = typeof res.data === "string" ? res.data : String(res.data);
      const bom  = csvText.startsWith("\uFEFF") ? csvText : "\uFEFF" + csvText;
      const blob = new Blob([bom], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `transactions-${Date.now()}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {
      alert("خطا در دانلود فایل");
    } finally {
      setDownloading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    setCurrentPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchTransactions(1, text, fromDate, toDate);
    }, 500);
  };

  const applyDateFilter = () => {
    setCurrentPage(1);
    fetchTransactions(1, searchQuery, fromDate, toDate);
    setShowDateFilter(false);
  };

  const clearDateFilter = () => {
    setFromDate(null); setToDate(null);
    setCurrentPage(1);
    fetchTransactions(1, searchQuery, null, null);
    setShowDateFilter(false);
  };

  const handleDelete = useCallback(async (tx) => {
    const msg = tx.type === "LOAN"
      ? `آیا مطمئنید می‌خواهید وام «${tx.title}» را حذف کنید؟ تمام اقساط هم حذف خواهند شد.`
      : (tx.type === "TRANSFER_IN" || tx.type === "TRANSFER_OUT")
        ? "با حذف این انتقال، هر دو سمت آن (کارت مبدا و مقصد) حذف می‌شود. ادامه می‌دهید؟"
        : `آیا مطمئنید می‌خواهید تراکنش «${tx.title}» را حذف کنید؟`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/finance/delete/${tx._id}`);
      fetchTransactions(currentPage, searchQuery, fromDate, toDate);
    } catch (err) {
      alertError(err, "خطا در حذف");
    }
  }, [currentPage, searchQuery, fromDate, toDate, fetchTransactions]);

  // ── کلیک روی "پرداخت" → modal نشون بده ──
  const handlePayInstallment = useCallback((id) => {
    setPendingInstallmentId(id);
    setPayModalVisible(true);
  }, []);

  // ── تأیید پرداخت با cardId (یا null) ──
  const handleConfirmPay = useCallback(async (cardId) => {
    setPayModalVisible(false);
    if (!pendingInstallmentId) return;
    try {
      await api.put(`/finance/pay-installment/${pendingInstallmentId}`, {
        cardId: cardId ?? null,
      });
      fetchTransactions(currentPage, searchQuery, fromDate, toDate);
    } catch (err) {
      alertError(err, "خطا در پرداخت قسط");
    } finally {
      setPendingInstallmentId(null);
    }
  }, [pendingInstallmentId, currentPage, searchQuery, fromDate, toDate, fetchTransactions]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchTransactions(page, searchQuery, fromDate, toDate);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchQuery, fromDate, toDate, fetchTransactions]);

  const openCreate = () => { setEditingTx(null); setIsModalOpen(true); };

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        .rmdp-input { width: 100% !important; height: 40px !important; border-radius: 0.75rem !important; background-color: var(--input-bg) !important; color: var(--ink) !important; border: 1px solid var(--input-border) !important; font-size: 0.8125rem !important; padding: 0.5rem 0.875rem !important; outline: none !important; text-align: right; font-family: 'Vazirmatn', sans-serif; }
        .rmdp-input:focus { border-color: var(--brand) !important; box-shadow: none !important; }
        .rmdp-input::placeholder { color: var(--muted-light); }
      `}</style>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">

        {/* هدر */}
        <div className="flex items-center mb-5">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors">
            <ArrowRight size={15} /> بازگشت
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-[color:var(--ink)]">تراکنش‌ها</h1>
          <div className="flex items-center gap-2">
            <button onClick={openCreate}
              className="bg-[var(--brand)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors">
              + جدید
            </button>
            <button onClick={handleDownloadCSV} disabled={downloading}
              className="w-9 h-9 rounded-xl border border-[color:var(--brand)] bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] flex items-center justify-center hover:bg-[color-mix(in_srgb,var(--brand)_20%,transparent)] transition-colors disabled:opacity-50"
              title="دانلود CSV" aria-label="دانلود CSV">
              {downloading
                ? <Loader2 size={15} className="animate-spin text-[color:var(--brand)]" />
                : <Download size={15} className="text-[color:var(--brand)]" />}
            </button>
          </div>
        </div>

        {/* سرچ و فیلتر */}
        <div className="flex flex-row-reverse gap-2 mb-3">
          <div className="flex-1 flex flex-row-reverse items-center gap-2 bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3 py-2.5">
            <Search size={14} className="text-[color:var(--muted)] shrink-0" />
            <input type="text" placeholder="جستجو..." value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 text-sm text-right bg-transparent outline-none text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]" />
            {searchQuery && (
              <button onClick={() => handleSearch("")} aria-label="پاک کردن جستجو">
                <X size={13} className="text-[color:var(--muted)]" />
              </button>
            )}
          </div>
          <button onClick={() => setShowDateFilter(!showDateFilter)}
            aria-label="فیلتر تاریخ" aria-pressed={showDateFilter}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
              hasDateFilter
                ? "bg-[var(--brand)] border-[color:var(--brand)] text-white"
                : "bg-[var(--card)] border-[color:var(--border)] text-[color:var(--brand)] hover:bg-[var(--hover)]"
            }`}>
            <Calendar size={15} />
          </button>
        </div>

        {/* پانل فیلتر تاریخ */}
        {showDateFilter && (
          <div className="bg-[var(--card)] border border-[color:var(--border)] rounded-2xl p-4 mb-4 space-y-3">
            <p className="text-xs font-bold text-[color:var(--ink)] text-right">فیلتر بازه زمانی</p>
            <div className="flex flex-row-reverse gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-[color:var(--muted)] mb-1.5 text-right">از تاریخ</label>
                <DatePicker className={pickerClass} calendar={persian} locale={persian_fa} value={fromDate}
                  onChange={(d) => setFromDate(d?.isValid ? d.toDate() : null)}
                  calendarPosition="bottom-right" placeholder="انتخاب تاریخ" maxDate={toDate || undefined} />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-[color:var(--muted)] mb-1.5 text-right">تا تاریخ</label>
                <DatePicker className={pickerClass} calendar={persian} locale={persian_fa} value={toDate}
                  onChange={(d) => setToDate(d?.isValid ? d.toDate() : null)}
                  calendarPosition="bottom-left" placeholder="انتخاب تاریخ" minDate={fromDate || undefined} />
              </div>
            </div>
            {hasDateFilter && (
              <p className="text-[11px] text-[color:var(--brand)] text-right font-medium">
                {fromDate ? formatJalali(fromDate) : "..."} تا {toDate ? formatJalali(toDate) : "..."}
              </p>
            )}
            <div className="flex flex-row-reverse gap-2">
              <button onClick={applyDateFilter}
                className="flex-1 bg-[var(--brand)] text-white text-xs font-bold rounded-xl py-2.5 hover:bg-[var(--brand-dark)] transition-colors">
                اعمال فیلتر
              </button>
              {hasDateFilter && (
                <button onClick={clearDateFilter}
                  className="bg-[var(--danger-light)] text-[color:var(--danger)] text-xs font-semibold rounded-xl px-4 py-2.5 hover:bg-[color-mix(in_srgb,var(--danger)_20%,transparent)] transition-colors">
                  حذف فیلتر
                </button>
              )}
            </div>
          </div>
        )}

        {/* لیست */}
        <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] shadow-sm">
          {!loading && totalItems > 0 && (
            <div className="px-4 py-3 border-b border-[color:var(--border)] flex flex-row-reverse items-center justify-between">
              <span className="text-xs text-[color:var(--muted)]">{totalItems} تراکنش</span>
              {hasDateFilter && (
                <span className="text-[10px] text-[color:var(--brand)] font-medium">
                  {fromDate ? formatJalali(fromDate) : "..."} تا {toDate ? formatJalali(toDate) : "..."}
                </span>
              )}
            </div>
          )}
          <div className="px-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-[color:var(--brand)]" size={24} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-sm text-[color:var(--muted)]">
                  {searchQuery || hasDateFilter ? "تراکنشی با این فیلتر یافت نشد" : "تراکنشی یافت نشد"}
                </p>
                {!searchQuery && !hasDateFilter && (
                  <button onClick={openCreate}
                    className="text-xs text-[color:var(--brand)] font-semibold hover:underline mt-1">
                    اولین تراکنشت رو ثبت کن
                  </button>
                )}
              </div>
            ) : (
              transactions.map((tx) => (
                <TxRow key={tx._id} tx={tx}
                  onPay={handlePayInstallment}
                  onView={setSelectedTx}
                  onEdit={(tx) => { setEditingTx(tx); setIsModalOpen(true); }}
                  onDelete={handleDelete}
                  display={display} unit={unit}
                />
              ))
            )}
          </div>
          {!loading && totalPages > 1 && (
            <div className="px-4 pb-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onEdit={(tx) => { setSelectedTx(null); setEditingTx(tx); setIsModalOpen(true); }}
        onDelete={(tx) => { setSelectedTx(null); handleDelete(tx); }}
        onPayInstallment={(id) => { setSelectedTx(null); handlePayInstallment(id); }}
      />

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTx(null); }}
        onRefreshData={() => fetchTransactions(currentPage, searchQuery, fromDate, toDate)}
        editingTransaction={editingTx}
        categories={categories}
        onCreateCategory={createCustomCategory}
        categoryFormLoading={categoryFormLoading}
      />

      {/* ── مودال پرداخت قسط ── */}
      <PayInstallmentModal
        visible={payModalVisible}
        onClose={() => {
          setPayModalVisible(false);
          setPendingInstallmentId(null);
        }}
        onConfirm={handleConfirmPay}
        cards={cards}
      />
    </div>
  );
}

