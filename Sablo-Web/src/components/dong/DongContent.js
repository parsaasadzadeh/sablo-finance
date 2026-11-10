"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { Users, Plus, Trash2, RotateCcw, ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { errorText } from "@/utils/apiError";
import { sanitizeDigits, formatAmountInput, toPersianNum } from "@/utils/formatters";
import PageShell from "@/components/shared/PageShell";

const MIN_PEOPLE = 2;
const MAX_PEOPLE = 30;
// سقف ورودی: ۱۳ رقم؛ تا جمع ۳۰ نفر و تبدیل به ریال از حد امن عدد صحیح رد نشود
const MAX_AMOUNT = 9_999_999_999_999;

const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)]";

const fa = (n) => Math.abs(n).toLocaleString("fa-IR");

const parseAmount = (s) => {
  const digits = sanitizeDigits(s).slice(0, 13);
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? 0 : Math.min(n, MAX_AMOUNT);
};

// برچسب کوتاه دکمه‌های سریع: ۵۰ هزار / ۱ میلیون
const shortAmount = (n) => {
  if (n >= 1_000_000 && n % 1_000_000 === 0) return `${toPersianNum(n / 1_000_000)} میلیون`;
  if (n >= 1_000 && n % 1_000 === 0) return `${toPersianNum(n / 1_000)} هزار`;
  return fa(n);
};

// محاسبهٔ لحظه‌ای سهم و تراز (همان منطق بک‌اند: عدد صحیح + پخش باقی‌مانده)
function computeLocal(people) {
  const n = people.length;
  const total = people.reduce((s, p) => s + p.paid, 0);
  const base = Math.floor(total / n);
  let remainder = total - base * n;
  const rows = people.map((p) => {
    const share = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    return { id: p.id, share, balance: p.paid - share };
  });
  return { total, rows };
}

export default function DongContent() {
  const { currency, unit } = useCurrency();
  const isRial = currency === "IRR";

  // مبالغ این صفحه به واحد انتخابی کاربرند؛ بک‌اند همیشه ریال ذخیره می‌کند
  const unitMul = isRial ? 10 : 1;
  const quickAmounts = [50_000, 100_000, 500_000, 1_000_000].map((a) => a * unitMul);
  const toRialFactor = isRial ? 1 : 10;

  const nextId = useRef(3);
  const [people, setPeople] = useState([
    { id: 1, name: "", paid: 0 },
    { id: 2, name: "", paid: 0 },
  ]);
  const [settlements, setSettlements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const reqId = useRef(0);
  const [myId, setMyId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { ok: boolean, text: string }

  const { total, rows } = useMemo(() => computeLocal(people), [people]);
  const equalShare = rows[0]?.share ?? 0;

  const displayName = (p, idx) => p.name.trim() || `شخص ${toPersianNum(idx + 1)}`;

  // کلید تغییرات: فقط id و مبلغ؛ تغییر نام درخواست جدید نمی‌سازد
  const paidKey = people.map((p) => `${p.id}:${p.paid}`).join("|");

  // ── محاسبهٔ خودکار تسویه (debounce) ──
  useEffect(() => {
    if (total <= 0) {
      reqId.current++; // درخواست در جریان را باطل کن
      setSettlements(null);
      setCalcError(null);
      setLoading(false);
      return undefined;
    }

    const myReq = reqId.current;
    setLoading(true);
    setCalcError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await api.post("/finance/dong/calculate", {
          // به‌جای نام، id را می‌فرستیم تا نام تکراری مشکلی ایجاد نکند
          participants: people.map((p) => ({ name: String(p.id), paid: p.paid })),
        });
        if (myReq !== reqId.current) return; // جواب قدیمی
        setSettlements(res.data.settlements);
      } catch (e) {
        if (myReq !== reqId.current) return;
        setSettlements(null);
        setCalcError(errorText(e, "خطا در محاسبه تسویه"));
      } finally {
        if (myReq === reqId.current) setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      reqId.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidKey]);

  const update = (id, patch) =>
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const addPerson = () => {
    if (people.length >= MAX_PEOPLE) return;
    setPeople((prev) => [...prev, { id: nextId.current++, name: "", paid: 0 }]);
  };

  const removePerson = (id) => {
    if (people.length <= MIN_PEOPLE) return;
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (myId === id) setMyId(null);
  };

  const resetAll = () => {
    setPeople((prev) => prev.map((p) => ({ ...p, paid: 0 })));
    setSaveMsg(null);
  };

  // ── ثبت سهم من به‌عنوان خرج ──
  const handleSaveMyShare = async () => {
    const idx = people.findIndex((p) => p.id === myId);
    if (idx < 0) return;
    const myShare = rows[idx].share;
    if (myShare <= 0) { setSaveMsg({ ok: false, text: "سهم شما صفر است." }); return; }

    const myShareInRial = myShare * toRialFactor;
    if (!Number.isSafeInteger(myShareInRial)) {
      setSaveMsg({ ok: false, text: "مبلغ واردشده معتبر نیست." });
      return;
    }

    setSaving(true);
    setSaveMsg(null);
    try {
      await api.post("/finance/dong/save", { title: "دنگ", myShare: myShareInRial });
      setSaveMsg({ ok: true, text: "سهم شما به‌عنوان خرج ثبت شد." });
    } catch (e) {
      const text = errorText(e, "خطا در ثبت. دوباره تلاش کنید.");
      if (text) setSaveMsg({ ok: false, text });
    } finally {
      setSaving(false);
    }
  };

  const nameById = new Map(people.map((p, i) => [String(p.id), displayName(p, i)]));

  return (
    <PageShell title="محاسبه دنگی">
      {/* کارت خلاصه */}
      <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-light)] flex items-center justify-center flex-shrink-0">
            <Users size={22} className="text-[color:var(--brand)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[color:var(--muted)]">جمع کل هزینه‌ها</p>
            <p className="text-xl font-extrabold text-[color:var(--ink)] mt-0.5">
              {fa(total)} {unit}
            </p>
          </div>
          <span className="bg-[var(--brand-light)] text-[color:var(--brand)] text-xs font-bold rounded-xl px-3 py-1.5">
            {toPersianNum(people.length)} نفر
          </span>
        </div>

        <div className="h-px bg-[var(--border)] my-3.5" />

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[color:var(--muted)]">سهم مساوی هر نفر</p>
            <p className="text-base font-bold text-[color:var(--brand)] mt-1">
              {fa(equalShare)} {unit}
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-[color:var(--muted)]">تعداد تسویه‌ها</p>
            <p className="text-base font-bold text-[color:var(--ink)] mt-1">
              {settlements ? `${toPersianNum(settlements.length)} پرداخت` : loading ? "..." : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* عنوان لیست */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[color:var(--ink)]">اعضای گروه و مبالغ پرداختی</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={resetAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--ink)] border border-[color:var(--border)] bg-[var(--card)] rounded-xl px-3 py-2 transition-colors">
            <RotateCcw size={13} /> پاک کردن مبالغ
          </button>
          <button type="button" onClick={addPerson} disabled={people.length >= MAX_PEOPLE}
            className="flex items-center gap-1.5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-50 text-white text-xs font-bold rounded-xl px-3.5 py-2 transition-colors">
            <Plus size={14} /> افزودن شخص
          </button>
        </div>
      </div>

      {/* کارت هر نفر */}
      <div className="space-y-3">
        {people.map((p, idx) => {
          const row = rows[idx];
          const isCreditor = row.balance > 0;
          const isDebtor = row.balance < 0;
          return (
            <div key={p.id} className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-3.5">
              <div className="flex items-center gap-3">
                <input type="text" value={p.name} maxLength={30}
                  onChange={(e) => update(p.id, { name: e.target.value })}
                  placeholder={`شخص ${toPersianNum(idx + 1)}`}
                  className={`${INPUT} text-right flex-1`} />
                <button type="button" onClick={() => removePerson(p.id)} aria-label="حذف"
                  className="p-2 rounded-lg text-[color:var(--danger)] hover:bg-[var(--danger-light)] transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2.5 border border-[color:var(--input-border)] bg-[var(--bg)] rounded-xl px-3">
                <span className="text-xs text-[color:var(--muted)] whitespace-nowrap">مبلغ پرداختی:</span>
                <input type="text" inputMode="numeric" dir="ltr" placeholder="0"
                  value={p.paid ? formatAmountInput(String(p.paid)) : ""}
                  onChange={(e) => update(p.id, { paid: parseAmount(e.target.value) })}
                  className="flex-1 min-w-0 bg-transparent outline-none py-3 text-base font-bold text-[color:var(--brand)] text-left tracking-wider placeholder:text-[color:var(--muted-light)]" />
                <span className="text-xs text-[color:var(--muted)]">{unit}</span>
              </div>

              {/* دکمه‌های سریع */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {quickAmounts.map((amt) => (
                  <button key={amt} type="button"
                    onClick={() => update(p.id, { paid: Math.min(p.paid + amt, MAX_AMOUNT) })}
                    className="text-xs font-semibold text-[color:var(--muted)] bg-[var(--bg)] border border-[color:var(--border)] hover:bg-[var(--hover)] rounded-lg px-2.5 py-1 transition-colors">
                    +{shortAmount(amt)} {unit}
                  </button>
                ))}
                <button type="button" onClick={() => update(p.id, { paid: 0 })}
                  className="text-xs font-semibold text-[color:var(--muted)] bg-[var(--bg)] border border-[color:var(--border)] hover:bg-[var(--hover)] rounded-lg px-2.5 py-1 transition-colors">
                  پاک کردن
                </button>
              </div>

              {/* سهم و تراز */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-[color:var(--muted)]">
                  سهم: {fa(row.share)} {unit}
                </span>
                <span
                  className={`text-xs font-bold rounded-lg px-2.5 py-1.5 ${
                    isCreditor
                      ? "bg-[var(--brand-light)] text-[color:var(--brand)]"
                      : isDebtor
                      ? "bg-[var(--danger-light)] text-[color:var(--danger)]"
                      : "bg-[var(--bg)] text-[color:var(--muted)]"
                  }`}>
                  {isCreditor
                    ? `طلبکار: ${fa(row.balance)} ${unit}`
                    : isDebtor
                    ? `بدهکار: ${fa(row.balance)} ${unit}`
                    : "تسویه"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* نتیجهٔ تسویه */}
      {total > 0 && (
        <div className={`bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mt-4 ${loading && settlements ? "opacity-60" : ""}`}>
          <h2 className="text-sm font-bold text-[color:var(--ink)] mb-2.5">نتیجه تسویه</h2>

          {calcError ? (
            <p className="text-sm text-center text-[color:var(--danger)] py-2">{calcError}</p>
          ) : !settlements ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-[color:var(--brand)]" />
            </div>
          ) : settlements.length === 0 ? (
            <p className="text-sm text-center text-[color:var(--muted)] py-2">حساب همه صاف است 🎉</p>
          ) : (
            settlements.map((s, i) => (
              <div key={i}
                className="flex items-center justify-between py-2.5 border-b border-[color:var(--border)] last:border-b-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
                  <span>{nameById.get(s.from) ?? s.from}</span>
                  <ArrowLeft size={14} className="text-[color:var(--muted)]" />
                  <span>{nameById.get(s.to) ?? s.to}</span>
                </div>
                <span className="text-sm font-bold text-[color:var(--brand)]">
                  {fa(s.amount)} {unit}
                </span>
              </div>
            ))
          )}

          {/* ثبت سهم من */}
          <div className="h-px bg-[var(--border)] my-3.5" />
          <p className="text-xs text-[color:var(--muted)] mb-2.5">
            سهم خودت را به‌عنوان خرج ثبت کن — تو کدام نفری؟
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {people.map((p, idx) => (
              <button key={p.id} type="button" onClick={() => { setMyId(p.id); setSaveMsg(null); }}
                className={`text-xs font-semibold rounded-lg border px-3 py-1.5 transition-colors ${
                  myId === p.id
                    ? "bg-[var(--brand)] border-[color:var(--brand)] text-white"
                    : "bg-[var(--bg)] border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[var(--hover)]"
                }`}>
                {displayName(p, idx)}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleSaveMyShare} disabled={myId === null || saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-[var(--brand-light)] text-[color:var(--brand)] text-sm font-bold disabled:opacity-50 transition-opacity">
            {saving ? <Loader2 size={16} className="animate-spin" /> : (<><Save size={16} /> ثبت سهم من در خرج‌ها</>)}
          </button>
          {saveMsg && (
            <p className={`text-xs text-center mt-2.5 ${saveMsg.ok ? "text-[color:var(--emerald-mid)]" : "text-[color:var(--danger)]"}`}>
              {saveMsg.text}
            </p>
          )}
        </div>
      )}
    </PageShell>
  );
}