"use client";
import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import api from "@/lib/axios";

export default function AiAnalysisCard() {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [usedToday, setUsedToday] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/ai/status");
        setUsedToday(res.data.usedToday);
        setResult(res.data.lastResult);
      } catch (err) {
        console.error("Error fetching AI status:", err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.post("/ai/analyze");
      setResult(res.data.analysis);
      setUsedToday(true);
    } catch (err) {
      console.error("Error getting AI analysis:", err);
      setError(err.response?.data?.message || "خطا در دریافت تحلیل، دوباره تلاش کنید");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="bg-[var(--card)] p-5 rounded-2xl border border-[color:var(--border)] mb-6 flex items-center justify-center h-24">
        <Loader2 className="animate-spin text-[color:var(--brand)]" size={22} />
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] p-5 rounded-2xl border border-[color:var(--border)] mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-[var(--brand-light)] rounded-xl shrink-0">
            <Sparkles size={18} className="text-[color:var(--brand)]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[color:var(--ink)]">تحلیل هوشمند وضعیت مالی</h2>
            <p className="text-[11px] text-[color:var(--muted)]">
              هر کاربر روزی یک‌بار می‌تواند از این قابلیت استفاده کند
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || usedToday}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
            usedToday
              ? "bg-[var(--border)] text-[color:var(--muted)] cursor-not-allowed"
              : "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
          }`}
        >
          {analyzing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> در حال تحلیل...
            </>
          ) : usedToday ? (
            "استفاده‌شده امروز"
          ) : (
            <>
              <RefreshCw size={14} /> بررسی
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-[color:var(--danger)] bg-[var(--danger-light)] border border-[color:var(--danger-border)] p-3 rounded-xl mt-2">
          {error}
        </p>
      )}

      {result && !error && (
        <div className="mt-2 bg-[var(--bg)] border border-[color:var(--border)] p-4 rounded-xl">
          <p className="text-xs leading-relaxed text-[color:var(--ink)] whitespace-pre-line">{result}</p>
        </div>
      )}

      {!result && !error && !analyzing && (
        <p className="text-xs text-[color:var(--muted)] mt-2">
          برای دریافت تحلیل هوش مصنوعی از وضعیت مالی‌تان، روی دکمه «بررسی» کلیک کنید.
        </p>
      )}
    </div>
  );
}
