"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/context/themeContext";
import api from "@/lib/axios";

// پالت نمودار: در تم تاریک رنگ‌های روشن‌تر برای خوانایی روی پس‌زمینه‌ی تیره
const PALETTE_LIGHT = [
  "#2563EB", "#E11D48", "#059669", "#D97706", "#7C3AED",
  "#DB2777", "#0891B2", "#65A30D", "#EA580C", "#4F46E5", "#0D9488", "#C026D3",
];
const PALETTE_DARK = [
  "#60A5FA", "#FB7185", "#34D399", "#FBBF24", "#A78BFA",
  "#F472B6", "#22D3EE", "#A3E635", "#FB923C", "#818CF8", "#2DD4BF", "#E879F9",
];

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 110;
const INNER_R = 68;
const GAP = 2;

// حالت‌های تاگل هزینه / درآمد (رنگ‌ها از متغیرهای تم)
const TYPES = [
  {
    key: "EXPENSE",
    label: "هزینه‌ها",
    active: "bg-[var(--danger-light)] border-[color:var(--danger)]",
  },
  {
    key: "INCOME",
    label: "درآمدها",
    active: "bg-[var(--success-light)] border-[color:var(--success)]",
  },
];

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

export default function CategoryDonut({ display, unit, from, to, cardId }) {
  const { mode } = useTheme();
  const palette = mode === "dark" ? PALETTE_DARK : PALETTE_LIGHT;

  const [activeType,  setActiveType]  = useState("EXPENSE");
  const [activeSlice, setActiveSlice] = useState(null);
  const [rawData,     setRawData]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: activeType };
      if (from)   params.from   = from;
      if (to)     params.to     = to;
      if (cardId) params.cardId = cardId;
      const res = await api.get("/finance/category-stats", { params });
      setRawData(res.data.categories ?? []);
      setActiveSlice(null);
    } catch {
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, [activeType, from, to, cardId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const data = useMemo(
    () =>
      rawData.map((c, i) => ({
        key:   c.id,
        label: c.label,
        icon:  c.icon,
        value: c.totalAmount,
        count: c.count,
        color: palette[i % palette.length],
      })),
    [rawData, palette]
  );

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
  const emptyText =
    activeType === "EXPENSE"
      ? "هنوز هزینه‌ی دسته‌بندی‌شده‌ای ثبت نشده"
      : "هنوز درآمد دسته‌بندی‌شده‌ای ثبت نشده";

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-6 mb-6">
      <h3 className="text-base font-bold text-[color:var(--ink)] mb-4 text-right">
        توزیع بر اساس دسته‌بندی
      </h3>

      {/* تاگل هزینه / درآمد */}
      <div className="flex flex-row-reverse gap-2 mb-5">
        {TYPES.map((t) => {
          const isActive = activeType === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              aria-pressed={isActive}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                isActive
                  ? `${t.active} text-[color:var(--ink)]`
                  : "bg-[var(--bg)] border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[var(--hover)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="animate-spin text-[color:var(--brand)]" size={24} />
        </div>
      ) : data.length === 0 || total === 0 ? (
        <p className="text-sm text-[color:var(--muted)] text-center py-10">{emptyText}</p>
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
                    opacity={activeSlice && !isActive ? 0.4 : 1}
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
                  <span className="text-xl mb-0.5">{activeData.icon}</span>
                  <span className="text-lg font-extrabold" style={{ color: activeData.color }}>
                    {display(activeData.value)}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">{unit}</span>
                  <span className="text-xs text-[color:var(--muted)] mt-1">{activeData.label}</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-[color:var(--muted)] mb-1">کل</span>
                  <span className="text-lg font-extrabold text-[color:var(--ink)]">{display(total)}</span>
                  <span className="text-xs text-[color:var(--muted)]">{unit}</span>
                </>
              )}
            </div>
          </div>

          {/* راهنما */}
          <div className="w-full mt-3 space-y-2">
            {data.map((d) => {
              const percent  = total > 0 ? Math.round((d.value / total) * 100) : 0;
              const isActive = activeSlice === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setActiveSlice(isActive ? null : d.key)}
                  aria-pressed={isActive}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]"
                      : "bg-[var(--bg)] hover:bg-[var(--hover)]"
                  }`}
                >
                  {/* سمت چپ: مبلغ + درصد */}
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-bold" style={{ color: d.color }}>
                      {display(d.value)} {unit}
                    </span>
                    <span className="text-[10px] text-[color:var(--muted)]">
                      {percent}٪ · {d.count} مورد
                    </span>
                  </div>
                  {/* سمت راست: آیکون + لیبل + دات */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[color:var(--ink)]">{d.label}</span>
                    <span className="text-sm">{d.icon}</span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
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
