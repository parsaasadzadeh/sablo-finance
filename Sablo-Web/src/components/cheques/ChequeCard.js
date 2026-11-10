"use client";
import { Trash2, Clock, CheckCircle2 } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";
import { toPersianNum } from "@/utils/formatters";
import { STATUS_LABEL } from "./chequeTypes";

export default function ChequeCard({ item, display, unit, onStatus, onDelete }) {
  const isPayable = item.direction === "PAYABLE";
  const accent = isPayable ? "var(--rose-mid)" : "var(--emerald-mid)";
  const badgeBg = isPayable ? "var(--rose-bg)" : "var(--emerald-bg)";
  const badgeText = isPayable ? "var(--rose-text)" : "var(--emerald-text)";
  const pending = item.status === "PENDING";

  const statusColor =
    item.status === "CLEARED" ? "var(--emerald-mid)" : item.status === "BOUNCED" ? "var(--rose-mid)" : "var(--muted)";

  const meta = [item.bank, item.chequeNumber ? `شماره ${toPersianNum(item.chequeNumber)}` : ""]
    .filter(Boolean)
    .join(" — ");

  return (
    <div
      className={`bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-3 ${
        pending ? "" : "opacity-80"
      }`}
    >
      {/* طرف حساب + نوع */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold truncate">{item.counterparty || "بدون طرف حساب"}</p>
          {meta ? <p className="text-[11px] text-[color:var(--muted)] mt-0.5 truncate">{meta}</p> : null}
        </div>
        <span
          className="text-[11px] font-bold rounded-[10px] px-2.5 py-1 shrink-0"
          style={{ background: badgeBg, color: badgeText }}
        >
          {isPayable ? "پرداختی" : "دریافتی"}
        </span>
      </div>

      {/* مبلغ + وضعیت */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[15px] font-extrabold" style={{ color: accent }}>
          {display(item.amount)} {unit}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: statusColor }}>
          {item.status === "CLEARED" && <CheckCircle2 size={14} />}
          {STATUS_LABEL[item.status] ?? item.status}
        </span>
      </div>

      {/* سررسید / تاریخ پاس */}
      {pending ? (
        <div
          className={`flex items-center gap-1 text-[10px] ${
            item.isOverdue ? "text-[color:var(--rose-mid)] font-bold" : "text-[color:var(--muted)]"
          }`}
        >
          <Clock size={12} />
          {item.isOverdue ? "گذشته از سررسید — " : "سررسید: "}
          {formatJalaliDate(item.dueDate)}
        </div>
      ) : (
        <p className="text-[10px] text-[color:var(--muted)]">
          سررسید: {formatJalaliDate(item.dueDate)}
          {item.clearedAt ? ` — ${isPayable ? "پاس" : "وصول"}: ${formatJalaliDate(item.clearedAt)}` : ""}
          {item.status === "CLEARED" && item.cardInfo ? ` — کارت ${item.cardInfo.name}` : ""}
        </p>
      )}
      {item.note ? <p className="text-[10px] text-[color:var(--muted)] mt-1.5">{item.note}</p> : null}

      {/* عملیات */}
      <div className="flex items-center gap-2 mt-3">
        {pending ? (
          <>
            <button
              onClick={() => onStatus(item, "CLEARED")}
              className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-bold rounded-xl py-2.5 transition-colors"
            >
              {isPayable ? "پاس شد" : "وصول شد"}
            </button>
            <button
              onClick={() => onStatus(item, "BOUNCED")}
              className="bg-[var(--input-bg)] border border-[color:var(--input-border)] text-[color:var(--muted)] text-[11px] font-semibold rounded-xl px-3.5 py-2.5 hover:bg-[var(--hover)] transition-colors"
            >
              برگشت خورد
            </button>
          </>
        ) : (
          <button
            onClick={() => onStatus(item, "PENDING")}
            className="flex-1 bg-[var(--input-bg)] border border-[color:var(--input-border)] text-[color:var(--ink)] text-xs font-bold rounded-xl py-2.5 hover:bg-[var(--hover)] transition-colors"
          >
            برگرداندن به در جریان
          </button>
        )}
        <button
          onClick={() => onDelete(item)}
          aria-label="حذف چک"
          className="bg-[var(--rose-bg)] text-[color:var(--rose-mid)] rounded-xl p-2.5 hover:opacity-80 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
