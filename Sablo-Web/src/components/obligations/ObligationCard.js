"use client";
import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, CheckCircle2, Clock } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";

export default function ObligationCard({ item, display, unit, onPay, onDelete, onDeletePayment }) {
  const [open, setOpen] = useState(false);

  const isDebt = item.kind === "DEBT";
  const accent = isDebt ? "var(--rose-mid)" : "var(--emerald-mid)";
  const badgeBg = isDebt ? "var(--rose-bg)" : "var(--emerald-bg)";
  const badgeText = isDebt ? "var(--rose-text)" : "var(--emerald-text)";

  return (
    <div
      className={`bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-3 ${
        item.isSettled ? "opacity-75" : ""
      }`}
    >
      {/* نام شخص + نوع */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold truncate">{item.person}</p>
          {item.title ? <p className="text-[11px] text-[color:var(--muted)] mt-0.5 truncate">{item.title}</p> : null}
        </div>
        <span
          className="text-[11px] font-bold rounded-[10px] px-2.5 py-1 shrink-0"
          style={{ background: badgeBg, color: badgeText }}
        >
          {isDebt ? "بدهی من" : "طلب من"}
        </span>
      </div>

      {/* مبلغ باقیمانده */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[color:var(--muted)]">{item.isSettled ? "مبلغ کل" : "باقیمانده"}</span>
        {item.isSettled ? (
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-[color:var(--emerald-mid)]">
            <CheckCircle2 size={16} /> تسویه شد
          </span>
        ) : (
          <span className="text-[15px] font-extrabold" style={{ color: accent }}>
            {display(item.remainingAmount)} {unit}
          </span>
        )}
      </div>

      {/* نوار پیشرفت */}
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden mb-1.5">
        <div className="h-full rounded-full" style={{ width: `${item.progressPercent}%`, background: accent }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-[color:var(--muted)] mb-1.5">
        <span>{isDebt ? "پرداخت‌شده" : "دریافت‌شده"}: {display(item.paidAmount)} {unit}</span>
        <span>از {display(item.amount)} {unit}</span>
      </div>

      {/* سررسید */}
      {item.dueDate && !item.isSettled ? (
        <div
          className={`flex items-center gap-1 text-[10px] mb-1.5 ${
            item.isOverdue ? "text-[color:var(--rose-mid)] font-bold" : "text-[color:var(--muted)]"
          }`}
        >
          <Clock size={12} />
          {item.isOverdue ? "عقب‌افتاده — " : "سررسید: "}
          {formatJalaliDate(item.dueDate)}
        </div>
      ) : null}

      {/* عملیات */}
      <div className="flex items-center gap-2 mt-2">
        {!item.isSettled && (
          <button
            onClick={() => onPay(item)}
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-bold rounded-xl py-2.5 transition-colors"
          >
            {isDebt ? "ثبت پرداخت" : "ثبت دریافت"}
          </button>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-1 bg-[var(--input-bg)] border border-[color:var(--input-border)] text-[color:var(--muted)] text-[11px] font-semibold rounded-xl px-3 py-2.5 hover:bg-[var(--hover)] transition-colors"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          جزئیات
        </button>
        <button
          onClick={() => onDelete(item)}
          aria-label={`حذف ${item.person}`}
          className="bg-[var(--rose-bg)] text-[color:var(--rose-mid)] rounded-xl p-2.5 hover:opacity-80 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* جزئیات + تاریخچه */}
      {open && (
        <div className="mt-3 pt-3 border-t border-[color:var(--border)]">
          {item.description ? (
            <p className="text-xs leading-5 text-[color:var(--ink-light)] mb-1.5">{item.description}</p>
          ) : null}
          <p className="text-[10px] text-[color:var(--muted)]">تاریخ ثبت: {formatJalaliDate(item.date)}</p>
          {item.affectsBalance ? (
            <p className="text-[10px] text-[color:var(--muted)] mt-0.5">
              روی موجودی اثر دارد
              {item.cardInfo ? ` — ثبت اولیه روی کارت ${item.cardInfo.name}` : " — ثبت اولیه روی همه حساب‌ها"}
            </p>
          ) : null}

          <p className="text-[11px] font-bold text-[color:var(--muted)] mt-3 mb-1.5">تاریخچه</p>
          {item.payments.length === 0 ? (
            <p className="text-[10px] text-[color:var(--muted)]">هنوز پرداختی ثبت نشده</p>
          ) : (
            <ul>
              {item.payments.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between gap-3 py-1.5 border-b border-[color:var(--border)] last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold">{display(p.amount)} {unit}</p>
                    <p className="text-[10px] text-[color:var(--muted)]">
                      {formatJalaliDate(p.date)}
                      {item.affectsBalance ? ` — ${p.cardInfo ? `کارت ${p.cardInfo.name}` : "همه حساب‌ها"}` : ""}
                      {p.note ? ` — ${p.note}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeletePayment(item, p)}
                    aria-label="حذف از تاریخچه"
                    className="p-1.5 rounded-lg text-[color:var(--muted)] hover:text-[color:var(--rose-mid)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
