"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/context/themeContext";
import api from "@/lib/axios";

// رنگ هر برش در تم روشن و تاریک
const SLICES = [
  { key: "totalIncome",              label: "درآمد",          light: "#059669", dark: "#34D399" },
  { key: "totalExpense",             label: "مخارج",          light: "#E11D48", dark: "#FB7185" },
  { key: "activeDebt",               label: "بدهی وام",       light: "#D97706", dark: "#FBBF24" },
  { key: "unpaidInstallmentsAmount", label: "اقساط نپرداخته", light: "#7C3AED", dark: "#A78BFA" },
];

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 110;
const INNER_R = 70;
const GAP = 2;

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function buildArcPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
  const outerEnd   = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd   = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc   = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export default function ChartDonut({ display, unit, from, to, cardId }) {
  const { mode } = useTheme();

  const [activeSlice, setActiveSlice] = useState(null);
  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (from)   params.from   = from;
      if (to)     params.to     = to;
      if (cardId) params.cardId = cardId;
      const res = await api.get("/finance/stats", { params });
      setSummary(res.data.summary ?? null);
      setActiveSlice(null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [from, to, cardId]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const data = useMemo(() => {
    if (!summary) return [];
    return SLICES.filter((s) => summary[s.key] > 0).map((s) => ({
      key:   s.key,
      label: s.label,
      color: mode === "dark" ? s.dark : s.light,
      value: summary[s.key],
    }));
  }, [summary, mode]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const slices = useMemo(() => {
    let currentAngle = 0;
    return data.map((d) => {
      const angle = total > 0 ? (d.value / total) * 360 : 0;
      const start = currentAngle;
      const end   = currentAngle + angle - GAP;
      currentAngle += angle;
      return { ...d, startAngle: start, endAngle: end };
    });
  }, [data, total]);

  const activeData = data.find((d) => d.key === activeSlice);

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-6 mb-6">
      <h3 className="text-base font-bold text-[color:var(--ink)] mb-6 text-right">توزیع مالی</h3>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-[color:var(--brand)]" size={24} />
        </div>
      ) : data.length === 0 || total === 0 ? (
        <p className="text-sm text-[color:var(--muted)] text-center py-10">
          هنوز تراکنشی در این بازه ثبت نشده
        </p>
      ) : (
        <div className="flex flex-col items-center">
          {/* نمودار */}
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE}>
              {slices.map((s) => {
                const isActive = activeSlice === s.key;
                return (
                  <path
                    key={s.key}
                    d={buildArcPath(CX, CY, isActive ? OUTER_R + 8 : OUTER_R, INNER_R, s.startAngle, s.endAngle)}
                    fill={s.color}
                    opacity={activeSlice && !isActive ? 0.35 : 1}
                    onClick={() => setActiveSlice(isActive ? null : s.key)}
                    className="cursor-pointer transition-all duration-200"
                  />
                );
              })}
            </svg>

            {/* متن وسط */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeData ? (
                <>
                  <span className="text-lg font-bold" style={{ color: activeData.color }}>
                    {display(activeData.value)}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">{unit}</span>
                  <span className="text-xs text-[color:var(--muted)] mt-1">{activeData.label}</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-[color:var(--muted)] mb-1">کل</span>
                  <span className="text-lg font-bold text-[color:var(--ink)]">{display(total)}</span>
                  <span className="text-xs text-[color:var(--muted)]">{unit}</span>
                </>
              )}
            </div>
          </div>

          {/* راهنما */}
          <div className="w-full mt-4 space-y-2">
            {data.map((d) => {
              const percent  = Math.round((d.value / total) * 100);
              const isActive = activeSlice === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setActiveSlice(isActive ? null : d.key)}
                  aria-pressed={isActive}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]"
                      : "bg-[var(--bg)] hover:bg-[var(--hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[color:var(--muted)]">{percent}٪</span>
                    <span className="text-sm font-bold" style={{ color: d.color }}>
                      {display(d.value)} {unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[color:var(--ink)]">{d.label}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
