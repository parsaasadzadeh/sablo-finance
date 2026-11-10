"use client";
import { Trash2, Target, TrendingUp, Clock } from "lucide-react";

export default function GoalCard({ goal, display, unit, onDelete, onDeposit }) {
  // رنگ وضعیت از متغیرهای تم خوانده می‌شه
  const statusVar = goal.isCompleted
    ? "var(--success)"
    : goal.isExpired
    ? "var(--danger)"
    : "var(--brand)";

  const deadlineDate = new Date(goal.deadline).toLocaleDateString("fa-IR");
  const percent = Math.min(100, goal.percent);

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-5 mb-4">
      {/* هدر */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onDelete(goal._id)}
          aria-label="حذف هدف"
          className="p-2 rounded-xl bg-[var(--danger-light)] hover:bg-[color-mix(in_srgb,var(--danger)_20%,transparent)] text-[color:var(--danger)] transition-colors"
        >
          <Trash2 size={15} />
        </button>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-[color:var(--ink)]">{goal.title}</h4>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${statusVar} 12%, transparent)` }}
          >
            <Target size={16} style={{ color: statusVar }} />
          </div>
        </div>
      </div>

      {/* نوار پیشرفت */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-bold" style={{ color: statusVar }}>
          {percent}٪
        </span>
        <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: statusVar }}
          />
        </div>
      </div>

      {/* مبالغ */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-[var(--success-light)] rounded-xl">
          <p className="text-[10px] text-[color:var(--muted)] mb-1">پس‌انداز شده</p>
          <p className="text-xs font-bold text-[color:var(--success)] tabular">
            {display(goal.savedAmount)}
            <span className="text-[9px] font-normal"> {unit}</span>
          </p>
        </div>
        <div className="text-center p-2 bg-[var(--danger-light)] rounded-xl">
          <p className="text-[10px] text-[color:var(--muted)] mb-1">باقی‌مانده</p>
          <p className="text-xs font-bold text-[color:var(--danger)] tabular">
            {display(goal.remaining)}
            <span className="text-[9px] font-normal"> {unit}</span>
          </p>
        </div>
        <div className="text-center p-2 bg-[var(--bg)] rounded-xl">
          <p className="text-[10px] text-[color:var(--muted)] mb-1">هدف</p>
          <p className="text-xs font-bold text-[color:var(--ink)] tabular">
            {display(goal.targetAmount)}
            <span className="text-[9px] font-normal"> {unit}</span>
          </p>
        </div>
      </div>

      {/* فوتر */}
      <div className="flex items-start justify-between pt-3 border-t border-[color:var(--border)]">
        {/* ستون راست: ددلاین + دکمه‌ی واریز زیرش */}
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-1 text-[color:var(--muted)]">
            <Clock size={12} />
            <span className="text-xs">ددلاین: {deadlineDate}</span>
          </div>

          {!goal.isCompleted && onDeposit && (
            <button
              type="button"
              onClick={() => onDeposit(goal)}
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-[11px] font-bold rounded-xl px-3.5 py-1.5 transition-colors"
            >
              + واریز به این هدف
            </button>
          )}
        </div>

        {/* ستون چپ: وضعیت */}
        {goal.isCompleted ? (
          <span className="text-xs font-bold text-[color:var(--success)] bg-[var(--success-light)] px-3 py-1 rounded-lg">
            🎉 به هدف رسیدی!
          </span>
        ) : goal.isExpired ? (
          <span className="text-xs font-bold text-[color:var(--danger)] bg-[var(--danger-light)] px-3 py-1 rounded-lg">
            منقضی شده
          </span>
        ) : goal.predictedMonths !== null ? (
          <div className="flex items-center gap-1 text-[color:var(--brand)]">
            <TrendingUp size={12} />
            <span className="text-xs font-bold">
              پیش‌بینی: {goal.predictedMonths} ماه دیگه
            </span>
          </div>
        ) : (
          <span className="text-xs text-[color:var(--muted)]">در حال محاسبه...</span>
        )}
      </div>
    </div>
  );
}
