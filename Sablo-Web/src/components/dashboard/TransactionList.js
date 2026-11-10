"use client";
import { useState } from "react";
import { Plus, CheckCircle, ChevronRight, ChevronLeft, Pencil, Trash2, Eye } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";
import TransactionDetailModal from "./TransactionDetailModal";
import PayInstallmentModal from "./PayInstallmentModal";
import { useCurrency } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext";

const TAB_OPTIONS = [
  { key: "ALL", label: "همه" },
  { key: "INCOME", label: "درآمدها" },
  { key: "EXPENSE", label: "مخارج" },
  { key: "INSTALLMENT", label: "اقساط" },
  { key: "LOAN", label: "وام‌ها" },
];

const TYPE_LABELS = { INCOME: "درآمد", EXPENSE: "خرج", INSTALLMENT: "قسط", LOAN: "وام", TRANSFER_IN: "دریافت", TRANSFER_OUT: "انتقال" };

const TYPE_COLORS = {
  INCOME: "bg-[var(--emerald-bg)] text-[color:var(--emerald-text)]",
  EXPENSE: "bg-[var(--rose-bg)] text-[color:var(--rose-text)]",
  INSTALLMENT: "bg-[var(--orange-bg)] text-[color:var(--orange-text)]",
  LOAN: "bg-[var(--info-light)] text-[color:var(--info)]",
  TRANSFER_IN: "bg-[var(--transfer-in-bg)] text-[color:var(--transfer-in-text)]",
  TRANSFER_OUT: "bg-[var(--transfer-out-bg)] text-[color:var(--transfer-out-text)]",
};

// رنگ مبلغ: انتقال/دریافت رنگ خودشان را دارند تا با درآمد و خرج اشتباه نشوند
const AMOUNT_COLORS = {
  TRANSFER_IN: "text-[color:var(--transfer-in)]",
  TRANSFER_OUT: "text-[color:var(--transfer-out)]",
};
const isTransferType = (t) => t === "TRANSFER_IN" || t === "TRANSFER_OUT";

// ── کامپوننت اصلی ────────────────────────────────────────────────────────────
export default function TransactionList({
  transactions, summary, currentPage, totalPages, onPageChange, onPayInstallment, onOpenModal,
  onEditTransaction, onDeleteTransaction,
}) {
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { cards } = useCard();
  const [payModal, setPayModal] = useState({ open: false, txId: null });
  const { display, unit } = useCurrency();

  const handlePayPress = (txId) => {
    if (cards.length === 0) {
      onPayInstallment(txId, null);
    } else {
      setPayModal({ open: true, txId });
    }
  };

  const handleConfirmPay = (cardId) => {
    setPayModal({ open: false, txId: null });
    onPayInstallment(payModal.txId, cardId);
  };

  const filteredTransactions = transactions.filter(
    (tx) => activeTab === "ALL" || tx.type === activeTab
  );

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-[color:var(--ink)]">ریز تراکنش‌ها</h3>
          <p className="text-[11px] text-[color:var(--muted)] mt-1">
            شما {summary.unpaidInstallmentsCount} قسط پرداخت نشده دارید.
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="flex items-center justify-center gap-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm"
        >
          <Plus size={16} /> ثبت تراکنش جدید
        </button>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-2 pb-4 mb-4 border-b border-[color:var(--border)] overflow-x-auto no-scrollbar -mx-1 px-1">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-xl transition-all whitespace-nowrap shrink-0 border ${
              activeTab === tab.key
                ? "bg-[var(--brand-light)] text-[color:var(--brand)] font-bold border-[color:var(--brand)]"
                : "bg-transparent text-[color:var(--muted)] border-transparent hover:text-[color:var(--ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-[color:var(--muted)]">تراکنشی در این دسته‌بندی یافت نشد.</p>
        </div>
      ) : (
        <div className="divide-y divide-[color:var(--border)] max-h-[480px] overflow-y-auto pr-1">
          {filteredTransactions.map((tx) => {
            const positive = tx.type === "INCOME" || tx.type === "LOAN" || tx.type === "TRANSFER_IN";
            return (
              <div
                key={tx._id}
                className="group py-4 px-1 sm:px-2 rounded-xl hover:bg-[var(--hover)] transition-colors"
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div
                    className={`w-10 h-9 sm:w-12 sm:h-10 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${TYPE_COLORS[tx.type]}`}
                  >
                    {TYPE_LABELS[tx.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[color:var(--ink)] truncate">{tx.title}</h4>
                        {tx.description && (
                          <p className="text-xs text-[color:var(--muted)] mt-0.5 break-words line-clamp-2">
                            {tx.description}
                          </p>
                        )}
                      </div>
                      <div className="text-left shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-bold tracking-wide tabular block whitespace-nowrap ${
                            AMOUNT_COLORS[tx.type] ?? (positive ? "text-[color:var(--emerald-mid)]" : "text-[color:var(--rose-mid)]")
                          }`}
                        >
                          {positive ? "+" : "-"}
                          {display(tx.amount)}
                          <span className="text-[10px] font-normal"> {unit}</span>
                        </span>
                        <span className="block text-[10px] text-[color:var(--muted-light)] mt-1 tabular whitespace-nowrap">
                          {formatJalaliDate(tx.date)}
                        </span>
                      </div>
                    </div>

                    {tx.dueDate && tx.type === "INSTALLMENT" && !tx.isPaid && (
                      <span className="inline-block bg-[var(--amber-bg)] text-[color:var(--amber-text)] text-[10px] px-2 py-0.5 rounded mt-2">
                        سررسید: {formatJalaliDate(tx.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 mt-2.5 pr-0 sm:pr-[3.5rem]">
                  {tx.type === "INSTALLMENT" && !tx.isPaid && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePayPress(tx._id); }}
                      className="text-[10px] bg-[var(--emerald-bg)] text-[color:var(--emerald-text)] hover:opacity-80 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-opacity ml-auto"
                    >
                      <CheckCircle size={12} /> پرداخت
                    </button>
                  )}
                  {tx.type === "INSTALLMENT" && tx.isPaid && (
                    <span className="text-[10px] text-[color:var(--emerald-mid)] flex items-center gap-1 ml-auto">
                      <CheckCircle size={12} /> پرداخت شده
                    </span>
                  )}

                  <button
                    aria-label="مشاهده"
                    onClick={(e) => { e.stopPropagation(); setSelectedTransaction(tx); }}
                    className="p-2 sm:p-1.5 rounded-lg text-[color:var(--muted)] hover:text-[color:var(--info)] hover:bg-[var(--info-light)] transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  {!isTransferType(tx.type) && (
                  <button
                    aria-label="ویرایش"
                    onClick={(e) => { e.stopPropagation(); onEditTransaction(tx); }}
                    className="p-2 sm:p-1.5 rounded-lg text-[color:var(--muted)] hover:text-[color:var(--brand)] hover:bg-[var(--brand-light)] transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  )}
                  <button
                    aria-label="حذف"
                    onClick={(e) => { e.stopPropagation(); onDeleteTransaction(tx); }}
                    className="p-2 sm:p-1.5 rounded-lg text-[color:var(--muted)] hover:text-[color:var(--rose-mid)] hover:bg-[var(--rose-bg)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-4 mt-2">
          <span className="text-[11px] text-[color:var(--muted)]">
            صفحه {currentPage} از {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              aria-label="صفحه قبل"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-[color:var(--border)] text-[color:var(--ink)] disabled:opacity-30 hover:bg-[var(--hover)]"
            >
              <ChevronRight size={16} />
            </button>
            <button
              aria-label="صفحه بعد"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-[color:var(--border)] text-[color:var(--ink)] disabled:opacity-30 hover:bg-[var(--hover)]"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
        onPayInstallment={handlePayPress}
      />

      <PayInstallmentModal
        visible={payModal.open}
        onClose={() => setPayModal({ open: false, txId: null })}
        onConfirm={handleConfirmPay}
        cards={cards}
      />
    </div>
  );
}

