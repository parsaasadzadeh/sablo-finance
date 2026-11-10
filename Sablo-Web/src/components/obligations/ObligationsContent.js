"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Users } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { alertError } from "@/utils/apiError";
import { toPersianNum } from "@/utils/formatters";
import PageShell from "@/components/shared/PageShell";
import ObligationCard from "./ObligationCard";
import CreateObligationModal from "./CreateObligationModal";
import PaymentModal from "./PaymentModal";

const TABS = [
  { key: "ALL", label: "همه" },
  { key: "DEBT", label: "بدهی‌های من" },
  { key: "CREDIT", label: "طلب‌های من" },
];

const EMPTY_SUMMARY = {
  iOwe: { total: 0, count: 0, overdueCount: 0, overdueAmount: 0 },
  owedToMe: { total: 0, count: 0, overdueCount: 0, overdueAmount: 0 },
  net: 0,
};

export default function ObligationsContent() {
  const { display, unit, currency } = useCurrency();

  const [tab, setTab] = useState("ALL");
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);

  const reqRef = useRef(0);

  const fetchAll = useCallback(async () => {
    const myReq = ++reqRef.current;
    try {
      const [list, sum] = await Promise.all([
        api.get("/obligations", { params: { limit: 100, kind: tab === "ALL" ? undefined : tab } }),
        api.get("/obligations/summary"),
      ]);
      if (myReq !== reqRef.current) return; // پاسخ کهنه (تب عوض شده)
      setItems(list.data.obligations ?? []);
      setSummary(sum.data.summary ?? EMPTY_SUMMARY);
      setLoadError(false);
    } catch (err) {
      if (myReq === reqRef.current) setLoadError(true);
      console.error("Error fetching obligations:", err);
    } finally {
      if (myReq === reqRef.current) setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (o) => {
    const extra = o.affectsBalance ? " و تراکنش‌های مربوطه" : "";
    if (!window.confirm(`«${o.person}» حذف شود؟\nتاریخچه‌ی پرداخت‌ها${extra} هم حذف می‌شوند.`)) return;
    try {
      await api.delete(`/obligations/${o._id}`);
      fetchAll();
    } catch (err) {
      alertError(err, "خطا در حذف");
    }
  };

  const handleDeletePayment = async (o, p) => {
    if (!window.confirm(`این ${o.kind === "DEBT" ? "پرداخت" : "دریافت"} حذف شود؟\nمبلغ به باقیمانده برمی‌گردد.`)) return;
    try {
      await api.delete(`/obligations/${o._id}/payments/${p._id}`);
      fetchAll();
    } catch (err) {
      alertError(err, "خطا در حذف پرداخت");
    }
  };

  const open = items.filter((i) => !i.isSettled);
  const settled = items.filter((i) => i.isSettled);
  const net = summary.net;

  const renderCard = (o) => (
    <ObligationCard
      key={o._id} item={o} display={display} unit={unit}
      onPay={setPayTarget} onDelete={handleDelete} onDeletePayment={handleDeletePayment}
    />
  );

  return (
    <PageShell title="طلب و بدهی" actionLabel="جدید" onAction={() => setCreateOpen(true)}>
      {/* خلاصه */}
      <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-4 flex gap-3">
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[color:var(--muted)] mb-1">بدهی من</p>
          <p className="text-sm font-extrabold text-[color:var(--rose-mid)]">{display(summary.iOwe.total)} {unit}</p>
          {summary.iOwe.overdueCount > 0 && (
            <p className="text-[10px] font-bold text-[color:var(--rose-mid)] mt-1">
              {toPersianNum(summary.iOwe.overdueCount)} مورد عقب‌افتاده
            </p>
          )}
        </div>
        <div className="w-px bg-[var(--border)] my-1" />
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[color:var(--muted)] mb-1">طلب من</p>
          <p className="text-sm font-extrabold text-[color:var(--emerald-mid)]">{display(summary.owedToMe.total)} {unit}</p>
          {summary.owedToMe.overdueCount > 0 && (
            <p className="text-[10px] font-bold text-[color:var(--rose-mid)] mt-1">
              {toPersianNum(summary.owedToMe.overdueCount)} مورد عقب‌افتاده
            </p>
          )}
        </div>
        <div className="w-px bg-[var(--border)] my-1" />
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[color:var(--muted)] mb-1">{net >= 0 ? "در مجموع طلبکارم" : "در مجموع بدهکارم"}</p>
          <p className={`text-sm font-extrabold ${net >= 0 ? "text-[color:var(--emerald-mid)]" : "text-[color:var(--rose-mid)]"}`}>
            {display(Math.abs(net))} {unit}
          </p>
        </div>
      </div>

      {/* تب‌ها */}
      <div role="tablist" className="flex bg-[var(--border)] rounded-2xl p-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => { if (t.key !== tab) { setTab(t.key); setLoading(true); } }}
            className={`flex-1 py-2 rounded-xl text-xs transition-colors ${
              tab === t.key
                ? "bg-[var(--card)] text-[color:var(--ink)] font-extrabold"
                : "text-[color:var(--muted)] font-semibold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[color:var(--brand)]" size={28} />
        </div>
      ) : loadError ? (
        <div className="text-center py-16">
          <p className="text-sm text-[color:var(--danger)] mb-3">دریافت اطلاعات با خطا مواجه شد</p>
          <button onClick={() => { setLoading(true); fetchAll(); }} className="text-xs font-bold text-[color:var(--brand)]">
            تلاش دوباره
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <div className="w-16 h-16 bg-[var(--border)] rounded-full flex items-center justify-center">
            <Users size={28} className="text-[color:var(--muted)]" />
          </div>
          <p className="text-sm font-semibold">هنوز چیزی ثبت نشده</p>
          <p className="text-xs text-[color:var(--muted)] max-w-xs leading-6">
            قرض‌هایی که به دیگران دادی یا از دیگران گرفتی رو اینجا ثبت کن تا هیچ‌وقت یادت نره
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-2 bg-[var(--brand)] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
          >
            ثبت اولین مورد
          </button>
        </div>
      ) : (
        <>
          {open.map(renderCard)}
          {settled.length > 0 && (
            <>
              <p className="text-xs font-bold text-[color:var(--muted)] mb-3 mt-2">تسویه‌شده‌ها</p>
              {settled.map(renderCard)}
            </>
          )}
        </>
      )}

      <CreateObligationModal
        key={tab /* با عوض شدن تب، نوع پیش‌فرض فرم هم عوض شود */}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setLoading(true); fetchAll(); }}
        unit={unit}
        currency={currency}
        defaultKind={tab === "CREDIT" ? "CREDIT" : "DEBT"}
      />

      <PaymentModal
        key={payTarget?._id ?? "none"}
        item={payTarget}
        onClose={() => setPayTarget(null)}
        onDone={fetchAll}
        display={display}
        unit={unit}
        currency={currency}
      />
    </PageShell>
  );
}
