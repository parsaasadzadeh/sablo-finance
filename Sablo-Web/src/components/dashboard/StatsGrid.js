"use client";
import { TrendingUp, ArrowUpCircle, ArrowDownCircle, HelpCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { useCurrency } from "@/context/currencyContext";

export default function StatsGrid({ summary }) {
  const { display, unit } = useCurrency();
  const isNegative = summary.cashBalance < 0;

  return (
    <>
      {/* بنر وضعیت — قبلاً رنگ پس‌زمینه و بردر نداشت؛ حالا مثل اپ رنگی است */}
      <div
        className={`mb-6 border rounded-2xl p-4 flex gap-3 items-start transition-all duration-300 ${
          isNegative
            ? "bg-[var(--amber-bg)] border-[color:var(--amber-mid)]/40"
            : "bg-[var(--emerald-bg)] border-[color:var(--emerald-mid)]/40"
        }`}
      >
        {isNegative ? (
          <>
            <AlertTriangle className="text-[color:var(--amber-mid)] shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-[color:var(--amber-text)]">تراز مالی منفی است!</h4>
              <p className="text-xs text-[color:var(--amber-text)] opacity-80 mt-1 leading-5">
                {display(Math.abs(summary.cashBalance))} {unit} کسری بودجه دارید.
              </p>
            </div>
          </>
        ) : (
          <>
            <ShieldCheck className="text-[color:var(--emerald-mid)] shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-[color:var(--emerald-text)]">وضعیت مالی پایدار</h4>
              <p className="text-xs text-[color:var(--emerald-text)] opacity-80 mt-1">
                {display(summary.cashBalance)} {unit} نقدینگی دارید.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* موجودی خالص */}
        <div
          className={`text-white p-5 rounded-2xl shadow-sm transition-colors ${
            !isNegative ? "bg-[var(--brand)]" : "bg-[var(--rose-mid)]"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs opacity-90">موجودی خالص</span>
            <TrendingUp size={18} className="opacity-90" />
          </div>
          <h2 className="text-xl font-bold tracking-wide tabular">
            {display(summary.cashBalance)}{" "}
            <span className="text-xs font-normal">{unit}</span>
          </h2>
        </div>

        {/* درآمد */}
        <div className="bg-[var(--card)] p-5 rounded-2xl border border-[color:var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--emerald-bg)] text-[color:var(--emerald-mid)] flex items-center justify-center shrink-0">
            <ArrowUpCircle size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[color:var(--muted)] block">کل درآمدهای خالص</span>
            <span className="text-base font-bold text-[color:var(--ink)] tabular">
              {display(summary.totalIncome)}{" "}
              <span className="text-[10px] font-normal">{unit}</span>
            </span>
          </div>
        </div>

        {/* مخارج */}
        <div className="bg-[var(--card)] p-5 rounded-2xl border border-[color:var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--rose-bg)] text-[color:var(--rose-mid)] flex items-center justify-center shrink-0">
            <ArrowDownCircle size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[color:var(--muted)] block">کل مخارج خالص</span>
            <span className="text-base font-bold text-[color:var(--ink)] tabular">
              {display(summary.totalExpense)}{" "}
              <span className="text-[10px] font-normal">{unit}</span>
            </span>
          </div>
        </div>

        {/* بدهی */}
        <div className="bg-[var(--card)] p-5 rounded-2xl border border-[color:var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--amber-bg)] text-[color:var(--amber-mid)] flex items-center justify-center shrink-0">
            <HelpCircle size={20} />
          </div>
          <div>
            <span className="text-[11px] text-[color:var(--muted)] block">بدهی باقی‌مانده (وام)</span>
            <span className="text-base font-bold text-[color:var(--amber-text)] tabular">
              {display(summary.activeDebt)}{" "}
              <span className="text-[10px] font-normal">{unit}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
