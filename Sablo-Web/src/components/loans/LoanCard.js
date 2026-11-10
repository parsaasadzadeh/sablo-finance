"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, Clock, Trash2 } from "lucide-react";
import PayInstallmentModal from "@/components/dashboard/PayInstallmentModal";
import { useCard } from "@/context/cardContext";

function formatJalali(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("fa-IR"); } catch { return ""; }
}

export default function LoanCard({ loan, display, unit, onPay, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const { cards } = useCard();

  // ── state مودال پرداخت ──
  const [payTargetId, setPayTargetId] = useState(null);

  const progressColor = loan.isFullyPaid
    ? "bg-[var(--emerald-mid)]"
    : loan.progressPercent >= 75
    ? "bg-[var(--info)]"
    : loan.progressPercent >= 40
    ? "bg-[var(--brand)]"
    : "bg-[var(--amber-mid)]";

  // کلیک روی پرداخت → اگه کارت داره modal بیاد، نداره مستقیم پرداخت
  const handlePayPress = (installmentId) => {
    if (cards.length === 0) {
      onPay(installmentId, null);
    } else {
      setPayTargetId(installmentId);
    }
  };

  const handleConfirmPay = (cardId) => {
    if (payTargetId) onPay(payTargetId, cardId);
    setPayTargetId(null);
  };

  return (
    <>
      <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] overflow-hidden mb-4">

        {/* هدر */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="text-right">
              <h3 className="text-sm font-bold text-[color:var(--ink)]">{loan.title}</h3>
              {loan.description && (
                <p className="text-xs text-[color:var(--muted)] mt-0.5">{loan.description}</p>
              )}
              <p className="text-xs text-[color:var(--muted)] mt-1">از {formatJalali(loan.date)}</p>
            </div>
            <div className="flex items-center gap-2">
              {loan.isFullyPaid && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[color:var(--emerald-text)] bg-[var(--emerald-bg)] px-2 py-1 rounded-full">
                  <CheckCircle size={10} /> تسویه شده
                </span>
              )}
              <button
                onClick={() => onDelete(loan)}
                aria-label="حذف وام"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--rose-bg)] transition-colors"
              >
                <Trash2 size={14} className="text-[color:var(--rose-mid)]" />
              </button>
            </div>
          </div>

          {/* progress bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] text-[color:var(--muted)]">
                {loan.paidCount} از {loan.installmentCount} قسط پرداخت شده
              </span>
              <span className="text-[11px] font-bold text-[color:var(--ink)]">{loan.progressPercent}٪</span>
            </div>
            <div className="h-2 bg-[var(--bg)] border border-[color:var(--border)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${loan.progressPercent}%` }}
              />
            </div>
          </div>

          {/* خلاصه مالی */}
          <div className="flex flex-row-reverse gap-2 mb-3">
            <div className="flex-1 bg-[var(--bg)] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-[color:var(--muted)] mb-0.5">پرداخت شده</p>
              <p className="text-xs font-bold text-[color:var(--emerald-mid)]">{display(loan.paidAmount)} {unit}</p>
            </div>
            <div className="flex-1 bg-[var(--bg)] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-[color:var(--muted)] mb-0.5">مانده</p>
              <p className="text-xs font-bold text-[color:var(--rose-mid)]">{display(loan.remainingAmount)} {unit}</p>
            </div>
            <div className="flex-1 bg-[var(--bg)] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-[color:var(--muted)] mb-0.5">هر قسط</p>
              <p className="text-xs font-bold text-[color:var(--ink)]">
                {display(loan.installments[0]?.amount ?? 0)} {unit}
              </p>
            </div>
          </div>

          {/* قسط بعدی */}
          {loan.nextInstallment && !loan.isFullyPaid && (
            <div className="flex items-center justify-between bg-[var(--warning-light)] border border-[color:var(--warning-border)] rounded-xl px-3 py-2.5">
              <button
                onClick={() => handlePayPress(loan.nextInstallment._id)}
                className="flex items-center gap-1.5 bg-[var(--emerald-mid)] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <CheckCircle size={12} /> پرداخت قسط
              </button>
              <div className="text-right">
                <p className="text-xs font-bold text-[color:var(--amber-text)]">قسط بعدی</p>
                <p className="text-[11px] text-[color:var(--amber-text)] opacity-80 flex items-center gap-1 justify-end">
                  <Clock size={10} /> {formatJalali(loan.nextInstallment.dueDate)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* دکمه نمایش اقساط */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-[color:var(--border)] text-xs font-semibold text-[color:var(--muted)] hover:bg-[var(--hover)] transition-colors"
        >
          {expanded
            ? <><ChevronUp size={14} /> بستن اقساط</>
            : <><ChevronDown size={14} /> نمایش همه اقساط ({loan.installmentCount})</>}
        </button>

        {/* لیست اقساط */}
        {expanded && (
          <div className="border-t border-[color:var(--border)] divide-y divide-[color:var(--border)]">
            {loan.installments.map((inst, i) => (
              <div
                key={inst._id}
                className={`flex items-center justify-between px-4 py-3 ${inst.isPaid ? "opacity-50" : ""}`}
              >
                <div className="text-right">
                  <p className="text-xs font-semibold text-[color:var(--ink)]">قسط {i + 1}</p>
                  <p className="text-[10px] text-[color:var(--muted)]">سررسید: {formatJalali(inst.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {inst.isPaid ? (
                    <span className="flex items-center gap-1 text-[10px] text-[color:var(--emerald-mid)] font-semibold">
                      <CheckCircle size={11} /> پرداخت شده
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePayPress(inst._id)}
                      className="text-[10px] font-bold text-[color:var(--emerald-text)] bg-[var(--emerald-bg)] px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity"
                    >
                      پرداخت
                    </button>
                  )}
                  <p className="text-xs font-bold text-[color:var(--ink)]">{display(inst.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال انتخاب کارت */}
      <PayInstallmentModal
        visible={!!payTargetId}
        onClose={() => setPayTargetId(null)}
        onConfirm={handleConfirmPay}
        cards={cards}
      />
    </>
  );
}
