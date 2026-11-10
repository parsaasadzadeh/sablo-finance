"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import api from "@/lib/axios";

function toJalali(gy, gm, gd) {
  const JY = gy - 1600, JM = gm - 1, JD = gd - 1;
  let g = 365 * JY + Math.floor((JY + 3) / 4) - Math.floor((JY + 99) / 100) + Math.floor((JY + 399) / 400);
  const gArr = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  g += gArr[JM] + JD;
  if (JM > 1 && ((JY % 4 === 0 && JY % 100 !== 0) || JY % 400 === 0)) g++;
  let j = g - 79;
  const np = Math.floor(j / 12053); j %= 12053;
  let jy = 979 + 33 * np + 4 * Math.floor(j / 1461); j %= 1461;
  if (j >= 366) { jy += Math.floor((j - 1) / 365); j = (j - 1) % 365; }
  const jArr = [0, 31, 62, 93, 124, 155, 185, 216, 246, 276, 306, 336];
  let jm = 0;
  for (let i = 11; i >= 0; i--) { if (j >= jArr[i]) { jm = i; break; } }
  return { jy, jm: jm + 1, jd: j - jArr[jm] + 1 };
}

function fromJalali(jy, jm, jd) {
  const JY = jy - 979, JM = jm - 1, JD = jd - 1;
  let j = 365 * JY + Math.floor(JY / 33) * 8 + Math.floor((JY % 33 + 3) / 4);
  const jArr = [0, 31, 62, 93, 124, 155, 185, 216, 246, 276, 306, 336];
  j += jArr[JM] + JD;
  let g = j + 79;
  let gy = 1600 + 400 * Math.floor(g / 146097); g %= 146097;
  let leap = true;
  if (g >= 36525) {
    g--; gy += 100 * Math.floor(g / 36524); g %= 36524;
    if (g >= 365) g++; else leap = false;
  }
  gy += 4 * Math.floor(g / 1461); g %= 1461;
  if (g >= 366) { leap = false; g--; gy += Math.floor(g / 365); g %= 365; }
  const gArr = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (let i = 0; i < 12; i++) { if (g < gArr[i]) { gm = i; break; } g -= gArr[i]; }
  return { gy, gm: gm + 1, gd: g + 1 };
}

function daysInJalaliMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const isLeap = (((jy - (jy > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682) % 2816 < 682;
  return isLeap ? 30 : 29;
}

const MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];

function buildAllPeriod() {
  return { isAll: true, label: "همه‌ی زمان‌ها" };
}

function buildMonthPeriod(jy, jm) {
  const start = fromJalali(jy, jm, 1);
  const days  = daysInJalaliMonth(jy, jm);
  const end   = fromJalali(jy, jm, days);
  const from  = new Date(Date.UTC(start.gy, start.gm - 1, start.gd, 0, 0, 0, 0)).toISOString();
  const to    = new Date(Date.UTC(end.gy, end.gm - 1, end.gd, 23, 59, 59, 999)).toISOString();
  return { isAll: false, jy, jm, from, to, label: `${MONTHS[jm - 1]} ${jy}` };
}

// استایل مشترک دکمه‌های گرد (همه‌ی تراکنش‌ها و ماه‌ها)
const PILL_ACTIVE   = "bg-[var(--brand)] border-[color:var(--brand)] text-white";
const PILL_INACTIVE =
  "bg-[var(--bg)] border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[var(--hover)]";

export default function MonthSelector({ display, unit, onPeriodChange, cardId }) {
  const todayG = new Date();
  const todayJ = toJalali(todayG.getFullYear(), todayG.getMonth() + 1, todayG.getDate());

  const [mode, setMode]       = useState("all");
  const [jy, setJy]           = useState(todayJ.jy);
  const [jm, setJm]           = useState(todayJ.jm);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async (period) => {
    setLoading(true);
    try {
      const params = {};
      if (!period.isAll && period.from && period.to) {
        params.from = period.from;
        params.to   = period.to;
      }
      if (cardId) params.cardId = cardId;
      const res = await api.get("/finance/stats", { params });
      setSummary(res.data.summary ?? null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    const period = mode === "all" ? buildAllPeriod() : buildMonthPeriod(jy, jm);
    onPeriodChange(period);
    fetchSummary(period);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, jy, jm]);

  return (
    <div dir="rtl" className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-5 mb-6">

      {/* دکمه همه */}
      <div className="flex justify-start mb-3">
        <button
          onClick={() => setMode("all")}
          aria-pressed={mode === "all"}
          className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
            mode === "all" ? PILL_ACTIVE : PILL_INACTIVE
          }`}
        >
          نمایش همه‌ی تراکنش‌ها
        </button>
      </div>

      {/* انتخاب سال
          در RTL: ChevronRight = رفتن به سال بعد (سمت راست = جلو)
                  ChevronLeft  = رفتن به سال قبل (سمت چپ  = عقب) */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={() => setJy((y) => y + 1)}
          aria-label="سال بعد"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[color:var(--brand)] hover:bg-[var(--hover)] transition-colors"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>

        <span className="text-base font-extrabold text-[color:var(--ink)] w-16 text-center">{jy}</span>

        <button
          onClick={() => setJy((y) => y - 1)}
          aria-label="سال قبل"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[color:var(--brand)] hover:bg-[var(--hover)] transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ماه‌ها — فروردین سمت راست، اسفند سمت چپ */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {MONTHS.map((label, i) => {
          const m        = i + 1;
          const isActive = mode === "pick" && jm === m;
          return (
            <button
              key={m}
              onClick={() => { setJm(m); setMode("pick"); }}
              aria-pressed={isActive}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                isActive ? PILL_ACTIVE : PILL_INACTIVE
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* خلاصه */}
      {loading ? (
        <div className="flex justify-center mt-4">
          <Loader2 className="animate-spin text-[color:var(--brand)]" size={20} />
        </div>
      ) : summary ? (
        <>
          <p className="text-sm font-bold text-[color:var(--ink)] text-center mt-4 mb-3">
            {mode === "all" ? "همه‌ی زمان‌ها" : `${MONTHS[jm - 1]} ${jy}`}
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-[var(--success-light)] rounded-2xl py-3 flex flex-col items-center">
              <span className="text-[11px] text-[color:var(--muted)] mb-1">درآمد</span>
              <span className="text-xs font-extrabold text-[color:var(--success)]">
                {display(summary.totalIncome)} {unit}
              </span>
            </div>
            <div className="flex-1 bg-[var(--danger-light)] rounded-2xl py-3 flex flex-col items-center">
              <span className="text-[11px] text-[color:var(--muted)] mb-1">خرج</span>
              <span className="text-xs font-extrabold text-[color:var(--danger)]">
                {display(summary.totalExpense)} {unit}
              </span>
            </div>
            <div className="flex-1 bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] rounded-2xl py-3 flex flex-col items-center">
              <span className="text-[11px] text-[color:var(--muted)] mb-1">مانده</span>
              <span className="text-xs font-extrabold text-[color:var(--brand)]">
                {display(summary.cashBalance)} {unit}
              </span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
