"use client";
import { ChevronDown, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCurrency } from "@/context/currencyContext";

function Field({ label, value, onPress, disabled }) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className="w-full flex items-center justify-between gap-3 py-2.5 border-t border-[color:var(--border)] text-right disabled:cursor-default"
    >
      <span className="text-xs text-[color:var(--muted)]">{label}</span>
      <span className="flex items-center gap-1 min-w-0">
        <span className="text-xs font-semibold text-[color:var(--ink)] truncate">{value}</span>
        {!disabled && <ChevronDown size={14} className="text-[color:var(--muted)] shrink-0" />}
      </span>
    </button>
  );
}

export default function DraftCard({
  draft, onConfirm, onCancel, onChangeType, onPickCategory, onPickCard, onPickIncomeSource,
}) {
  const { display, unit } = useCurrency();
  const isIncome = draft.type === "INCOME";
  const locked = draft.status !== "pending";

  return (
    <div
      className={`bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-3.5 w-full ${
        draft.status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <p className="text-[11px] text-[color:var(--muted)] mb-1.5">پیش‌نویس تراکنش</p>

      <p
        className={`text-2xl font-bold ${
          isIncome ? "text-[color:var(--emerald-mid)]" : "text-[color:var(--rose-mid)]"
        }`}
      >
        {isIncome ? "+" : "−"} {display(draft.amount)}{" "}
        <span className="text-xs font-medium text-[color:var(--muted)]">{unit}</span>
      </p>
      <p className="text-sm font-bold text-[color:var(--ink)] mt-0.5 mb-2.5">{draft.title}</p>

      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {[
          ["EXPENSE", "خرج", "bg-[var(--rose-bg)] border-[color:var(--rose-mid)] text-[color:var(--rose-text)]"],
          ["INCOME", "درآمد", "bg-[var(--emerald-bg)] border-[color:var(--emerald-mid)] text-[color:var(--emerald-text)]"],
        ].map(([t, label, activeCls]) => (
          <button
            key={t}
            type="button"
            disabled={locked}
            onClick={() => onChangeType(t)}
            className={`py-2 rounded-[10px] border text-xs font-semibold transition-colors ${
              draft.type === t
                ? activeCls
                : "bg-[var(--input-bg)] border-[color:var(--input-border)] text-[color:var(--muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Field
        label="دسته‌بندی"
        disabled={locked}
        onPress={onPickCategory}
        value={draft.categoryLabel ? `${draft.categoryIcon ?? ""} ${draft.categoryLabel}`.trim() : "انتخاب نشده"}
      />
      <Field label="کارت" disabled={locked} onPress={onPickCard} value={draft.cardName ?? "بدون کارت"} />
      {isIncome && (
        <Field
          label="منبع درآمد"
          disabled={locked}
          onPress={onPickIncomeSource}
          value={draft.incomeSourceLabel ?? "بدون منبع"}
        />
      )}
      <div className="flex items-center justify-between gap-3 py-2.5 border-t border-[color:var(--border)]">
        <span className="text-xs text-[color:var(--muted)]">تاریخ</span>
        <span className="text-xs font-semibold text-[color:var(--ink)]">{draft.dateJalali}</span>
      </div>

      {draft.status === "saved" ? (
        <div className="flex items-center justify-center gap-1.5 pt-2.5 border-t border-[color:var(--border)]">
          <CheckCircle2 size={16} className="text-[color:var(--emerald-mid)]" />
          <span className="text-[13px] font-bold text-[color:var(--emerald-text)]">ثبت شد</span>
        </div>
      ) : draft.status === "cancelled" ? (
        <div className="flex items-center justify-center gap-1.5 pt-2.5 border-t border-[color:var(--border)]">
          <XCircle size={16} className="text-[color:var(--muted)]" />
          <span className="text-[13px] font-bold text-[color:var(--muted)]">لغو شد</span>
        </div>
      ) : (
        <div className="flex gap-2 mt-1.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={draft.status === "saving"}
            className="flex-[2] bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white text-[13px] font-bold rounded-xl py-2.5 flex items-center justify-center transition-colors"
          >
            {draft.status === "saving" ? <Loader2 size={16} className="animate-spin" /> : "ثبت تراکنش"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={draft.status === "saving"}
            className="flex-1 border border-[color:var(--input-border)] text-[color:var(--muted)] text-[13px] font-semibold rounded-xl py-2.5 hover:bg-[var(--hover)] transition-colors"
          >
            لغو
          </button>
        </div>
      )}
    </div>
  );
}
