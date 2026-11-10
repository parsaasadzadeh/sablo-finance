"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCurrency } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext";
import MonthSelector from "@/components/reports/MonthSelector";
import ChartDonut from "@/components/reports/ChartDonut";
import CategoryDonut from "@/components/reports/CategoryDonut";
import MonthlyComparison from "@/components/reports/MonthlyComparison";

export default function ReportsContent() {
  const router = useRouter();
  const { display, unit } = useCurrency();
  const { activeCard } = useCard();

  const [period, setPeriod] = useState({ isAll: true, label: "همه‌ی زمان‌ها" });

  const from   = period.isAll ? undefined : period.from;
  const to     = period.isAll ? undefined : period.to;
  const cardId = activeCard?._id ?? undefined;

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] p-4 sm:p-8 font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'); .font-sans { font-family: 'Vazirmatn', sans-serif; }`}</style>

      <div className="max-w-2xl mx-auto">
        {/* هدر */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <ArrowRight size={16} /> بازگشت
          </button>
          <h1 className="text-xl font-bold text-[color:var(--ink)]">گزارش‌های مالی</h1>
          <div />
        </div>

        {/* بنر کارت فعال (رنگ از خود کارت می‌آید) */}
        {activeCard && (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5 text-white text-sm font-semibold"
            style={{ backgroundColor: activeCard.color }}
          >
            <span className="text-xl">{activeCard.icon}</span>
            <span>گزارش‌های کارت «{activeCard.name}»</span>
          </div>
        )}

        <MonthSelector display={display} unit={unit} onPeriodChange={setPeriod} cardId={cardId} />

        <ChartDonut       display={display} unit={unit} from={from} to={to} cardId={cardId} />
        <CategoryDonut    display={display} unit={unit} from={from} to={to} cardId={cardId} />
        <MonthlyComparison display={display} unit={unit} cardId={cardId} />
      </div>
    </div>
  );
}
