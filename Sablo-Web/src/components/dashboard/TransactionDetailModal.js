"use client";
import { useEffect } from "react";
import { X, CheckCircle, Clock, Pencil, Trash2 } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";
import { useCurrency } from "@/context/currencyContext";

const TYPE_LABELS = {
  INCOME: "درآمد",
  EXPENSE: "خرج",
  INSTALLMENT: "قسط",
  LOAN: "وام",
  TRANSFER_IN: "دریافت",
  TRANSFER_OUT: "انتقال",
};

const TYPE_COLORS = {
  INCOME: "bg-[var(--emerald-bg)] text-[color:var(--emerald-text)]",
  EXPENSE: "bg-[var(--rose-bg)] text-[color:var(--rose-text)]",
  INSTALLMENT: "bg-[var(--orange-bg)] text-[color:var(--orange-text)]",
  LOAN: "bg-[var(--info-light)] text-[color:var(--info)]",
  TRANSFER_IN: "bg-[var(--transfer-in-bg)] text-[color:var(--transfer-in-text)]",
  TRANSFER_OUT: "bg-[var(--transfer-out-bg)] text-[color:var(--transfer-out-text)]",
};

// جعبه‌ی مبلغ: انتقال/دریافت رنگ خودشان را دارند
const AMOUNT_BOX = {
  TRANSFER_IN: { bg: "bg-[var(--transfer-in-bg)]", text: "text-[color:var(--transfer-in-text)]" },
  TRANSFER_OUT: { bg: "bg-[var(--transfer-out-bg)]", text: "text-[color:var(--transfer-out-text)]" },
};

function CategoryDisplay({ tx }) {
  if (tx.categoryInfo) {
    return (
      <span className="text-[color:var(--ink)] font-medium flex items-center gap-1 justify-end">
        {tx.categoryInfo.icon && <span>{tx.categoryInfo.icon}</span>}
        {tx.categoryInfo.label}
      </span>
    );
  }
  if (tx.category) {
    return <span className="text-[color:var(--muted)] font-medium">دسته‌بندی حذف‌شده</span>;
  }
  return <span className="text-[color:var(--muted)] font-medium">عمومی</span>;
}

export default function TransactionDetailModal({ transaction, onClose, onEdit, onDelete, onPayInstallment }) {
  const { display, unit } = useCurrency();

  // بستن با Escape و قفل اسکرول صفحه‌ی پشت مودال
  useEffect(() => {
    if (!transaction) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [transaction, onClose]);

  if (!transaction) return null;
  const tx = transaction;
  const isPositive = tx.type === "INCOME" || tx.type === "LOAN" || tx.type === "TRANSFER_IN";

  return (
    <div
      className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-[var(--card)] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 border border-[color:var(--border)] shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${TYPE_COLORS[tx.type]}`}
            >
              {TYPE_LABELS[tx.type]}
            </div>
            <h3 className="text-base font-bold text-[color:var(--ink)] break-words">{tx.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-lg text-[color:var(--muted)] hover:bg-[var(--hover)] shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* مبلغ */}
        <div className={`rounded-2xl p-4 mb-4 ${AMOUNT_BOX[tx.type]?.bg ?? (isPositive ? "bg-[var(--emerald-bg)]" : "bg-[var(--rose-bg)]")}`}>
          <span className="text-[11px] text-[color:var(--muted)] block mb-1">مبلغ تراکنش</span>
          <span
            className={`text-xl font-bold tabular tracking-wide ${
              AMOUNT_BOX[tx.type]?.text ?? (isPositive ? "text-[color:var(--emerald-text)]" : "text-[color:var(--rose-text)]")
            }`}
          >
            {isPositive ? "+" : "-"}
            {display(tx.amount)} <span className="text-xs font-normal">{unit}</span>
          </span>
        </div>

        {/* توضیحات */}
        {tx.description && (
          <div className="mb-4">
            <span className="text-[11px] text-[color:var(--muted)] block mb-1">توضیحات</span>
            <p className="text-sm text-[color:var(--ink-light)] leading-6 break-words whitespace-pre-wrap">
              {tx.description}
            </p>
          </div>
        )}

        {/* اطلاعات تکمیلی */}
        <div className="space-y-2.5 mb-5">
          {tx.type === "EXPENSE" && (
            <div className="flex items-center justify-between text-xs border-b border-[color:var(--border)] pb-2.5">
              <span className="text-[color:var(--muted)]">دسته‌بندی</span>
              <CategoryDisplay tx={tx} />
            </div>
          )}

          <div className="flex items-center justify-between text-xs border-b border-[color:var(--border)] pb-2.5">
            <span className="text-[color:var(--muted)]">تاریخ ثبت</span>
            <span className="text-[color:var(--ink)] font-medium tabular">{formatJalaliDate(tx.date)}</span>
          </div>

          {tx.dueDate && (tx.type === "INSTALLMENT" || tx.type === "LOAN") && (
            <div className="flex items-center justify-between text-xs border-b border-[color:var(--border)] pb-2.5">
              <span className="text-[color:var(--muted)]">تاریخ سررسید</span>
              <span className="text-[color:var(--ink)] font-medium tabular">{formatJalaliDate(tx.dueDate)}</span>
            </div>
          )}

          {tx.type === "INSTALLMENT" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[color:var(--muted)]">وضعیت پرداخت</span>
              {tx.isPaid ? (
                <span className="text-[color:var(--emerald-mid)] font-medium flex items-center gap-1">
                  <CheckCircle size={13} /> پرداخت شده
                </span>
              ) : (
                <span className="text-[color:var(--amber-mid)] font-medium flex items-center gap-1">
                  <Clock size={13} /> پرداخت نشده
                </span>
              )}
            </div>
          )}
        </div>

        {/* اکشن‌ها */}
        <div className="flex gap-2">
          {tx.type === "INSTALLMENT" && !tx.isPaid && (
            <button
              onClick={() => { onPayInstallment(tx._id); onClose(); }}
              className="flex-1 bg-[var(--emerald-mid)] hover:opacity-90 text-white text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-opacity"
            >
              <CheckCircle size={14} /> پرداخت قسط
            </button>
          )}
          {tx.type !== "TRANSFER_IN" && tx.type !== "TRANSFER_OUT" && (
          <button
            onClick={() => { onEdit(tx); onClose(); }}
            className="flex-1 bg-[var(--brand-light)] hover:opacity-80 text-[color:var(--brand)] text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-opacity"
          >
            <Pencil size={14} /> ویرایش
          </button>
          )}
          <button
            onClick={() => { onDelete(tx); onClose(); }}
            className="flex-1 bg-[var(--rose-bg)] hover:opacity-80 text-[color:var(--rose-mid)] text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-opacity"
          >
            <Trash2 size={14} /> حذف
          </button>
        </div>
      </div>
    </div>
  );
}

