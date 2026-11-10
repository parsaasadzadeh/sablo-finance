"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import api from "@/lib/axios";

const ROWS = [
  { key: "income",      label: "درآمد",       positiveIsGood: true  },
  { key: "expense",     label: "مخارج",       positiveIsGood: false },
  { key: "cashBalance", label: "موجودی خالص", positiveIsGood: true  },
];

const CARD = "bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-6 mb-6";

function ChangeIndicator({ percent, positiveIsGood }) {
  if (percent === 0) {
    return (
      <div className="flex items-center justify-center gap-1 text-[color:var(--muted)]">
        <Minus size={12} />
        <span className="text-xs">بدون تغییر</span>
      </div>
    );
  }

  const isUp = percent > 0;
  const isGood = positiveIsGood ? isUp : !isUp;
  const color = isGood ? "text-[color:var(--success)]" : "text-[color:var(--danger)]";

  return (
    <div className={`flex items-center justify-center gap-1 ${color}`}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span className="text-xs font-bold">
        {isUp ? "+" : ""}{percent}٪
      </span>
    </div>
  );
}

export default function MonthlyComparison({ display, unit, cardId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (cardId) params.cardId = cardId;
        const res = await api.get("/finance/monthly-comparison", { params });
        setData(res.data);
      } catch {
        setError("خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cardId]);

  if (loading) {
    return (
      <div className={`${CARD} flex items-center justify-center h-40`}>
        <Loader2 className="animate-spin text-[color:var(--brand)]" size={24} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={CARD}>
        <p className="text-sm text-[color:var(--danger)] text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-[color:var(--ink)] mb-6 text-right">مقایسه ماهانه</h3>

      {/* هدر ستون‌ها */}
      <div className="grid grid-cols-4 gap-2 mb-2 px-2">
        <span className="text-xs font-bold text-[color:var(--muted)] text-right">شاخص</span>
        <span className="text-xs font-bold text-[color:var(--muted)] text-center">ماه قبل</span>
        <span className="text-xs font-bold text-[color:var(--muted)] text-center">این ماه</span>
        <span className="text-xs font-bold text-[color:var(--muted)] text-center">تغییر</span>
      </div>

      {/* ردیف‌ها */}
      <div className="space-y-2">
        {ROWS.map((row, i) => (
          <div
            key={row.key}
            className={`grid grid-cols-4 gap-2 px-3 py-3 rounded-xl items-center ${
              i % 2 === 0 ? "bg-[var(--bg)]" : "bg-[var(--card)]"
            }`}
          >
            <span className="text-sm font-semibold text-[color:var(--ink)] text-right">
              {row.label}
            </span>
            <span className="text-xs text-[color:var(--muted)] text-center tabular">
              {display(data.previous[row.key])}
            </span>
            <span className="text-xs font-bold text-[color:var(--ink)] text-center tabular">
              {display(data.current[row.key])}
            </span>
            <ChangeIndicator percent={data.changes[row.key]} positiveIsGood={row.positiveIsGood} />
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[color:var(--muted)] text-right mt-4">
        * مبالغ به {unit}
      </p>
    </div>
  );
}
