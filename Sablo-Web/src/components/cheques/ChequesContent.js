"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, FileText } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import { alertError } from "@/utils/apiError";
import { toPersianNum } from "@/utils/formatters";
import PageShell from "@/components/shared/PageShell";
import ChequeCard from "./ChequeCard";
import CreateChequeModal from "./CreateChequeModal";
import ClearChequeModal from "./ClearChequeModal";
import { EMPTY_SUMMARY } from "./chequeTypes";

const TABS = [
  { key: "ALL", label: "همه" },
  { key: "PAYABLE", label: "پرداختی" },
  { key: "RECEIVABLE", label: "دریافتی" },
];

export default function ChequesContent() {
  const { display, unit, currency } = useCurrency();

  const [tab, setTab] = useState("ALL");
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [clearTarget, setClearTarget] = useState(null);

  const reqRef = useRef(0);

  const fetchAll = useCallback(async () => {
    const myReq = ++reqRef.current;
    try {
      const [list, sum] = await Promise.all([
        api.get("/cheques", { params: { limit: 100, direction: tab === "ALL" ? undefined : tab } }),
        api.get("/cheques/summary"),
      ]);
      if (myReq !== reqRef.current) return; // پاسخ کهنه (تب عوض شده)
      setItems(list.data.cheques ?? []);
      setSummary(sum.data.summary ?? EMPTY_SUMMARY);
      setLoadError(false);
    } catch (err) {
      if (myReq === reqRef.current) setLoadError(true);
      console.error("Error fetching cheques:", err);
    } finally {
      if (myReq === reqRef.current) setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // تغییر وضعیت؛ cardId فقط برای CLEARED فرستاده می‌شود (null = بدون کارت)
  const sendStatus = async (cheque, status, cardId) => {
    try {
      await api.patch(`/cheques/${cheque._id}/status`, {
        status,
        ...(status === "CLEARED" ? { cardId: cardId ?? null } : {}),
      });
      fetchAll();
      return true;
    } catch (err) {
      alertError(err, "خطا در تغییر وضعیت");
      return false;
    }
  };

  const handleStatus = (cheque, status) => {
    if (status === "CLEARED") { setClearTarget(cheque); return; }
    if (status === "BOUNCED") {
      if (!window.confirm("این چک به‌عنوان برگشتی ثبت شود؟")) return;
    }
    if (status === "PENDING" && cheque.status === "CLEARED") {
      if (!window.confirm("چک به «در جریان» برمی‌گردد و تراکنشی که موقع پاس شدن ساخته شده حذف می‌شود. ادامه می‌دهی؟")) return;
    }
    sendStatus(cheque, status);
  };

  const handleConfirmClear = async (cheque, cardId) => {
    const ok = await sendStatus(cheque, "CLEARED", cardId);
    if (ok) setClearTarget(null);
  };

  const handleDelete = async (cheque) => {
    const extra = cheque.status === "CLEARED" ? "\nتراکنش مربوطه هم حذف می‌شود." : "";
    if (!window.confirm(`این چک حذف شود؟${extra}`)) return;
    try {
      await api.delete(`/cheques/${cheque._id}`);
      fetchAll();
    } catch (err) {
      alertError(err, "خطا در حذف");
    }
  };

  const pending = items.filter((i) => i.status === "PENDING");
  const closed = items.filter((i) => i.status !== "PENDING");
  const net = summary.net;

  const renderCard = (c) => (
    <ChequeCard key={c._id} item={c} display={display} unit={unit} onStatus={handleStatus} onDelete={handleDelete} />
  );

  return (
    <PageShell title="چک‌ها" actionLabel="جدید" onAction={() => setCreateOpen(true)}>
      {/* خلاصه */}
      <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-4 flex gap-3">
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[color:var(--muted)] mb-1">پرداختی در جریان</p>
          <p className="text-sm font-extrabold text-[color:var(--rose-mid)]">{display(summary.payable.total)} {unit}</p>
          {summary.payable.overdueCount > 0 && (
            <p className="text-[10px] font-bold text-[color:var(--rose-mid)] mt-1">
              {toPersianNum(summary.payable.overdueCount)} چک گذشته از سررسید
            </p>
          )}
        </div>
        <div className="w-px bg-[var(--border)] my-1" />
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[color:var(--muted)] mb-1">دریافتی در جریان</p>
          <p className="text-sm font-extrabold text-[color:var(--emerald-mid)]">{display(summary.receivable.total)} {unit}</p>
          {summary.receivable.overdueCount > 0 && (
            <p className="text-[10px] font-bold text-[color:var(--rose-mid)] mt-1">
              {toPersianNum(summary.receivable.overdueCount)} چک گذشته از سررسید
            </p>
          )}
        </div>
        <div className="w-px bg-[var(--border)] my-1" />
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[color:var(--muted)] mb-1">{net >= 0 ? "خالص (به نفع من)" : "خالص (به ضرر من)"}</p>
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
            <FileText size={28} className="text-[color:var(--muted)]" />
          </div>
          <p className="text-sm font-semibold">هنوز چکی ثبت نشده</p>
          <p className="text-xs text-[color:var(--muted)] max-w-xs leading-6">
            چک‌های پرداختی و دریافتی‌ات را با تاریخ سررسید ثبت کن تا هیچ سررسیدی از دستت نرود
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-2 bg-[var(--brand)] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
          >
            ثبت اولین چک
          </button>
        </div>
      ) : (
        <>
          {pending.map(renderCard)}
          {closed.length > 0 && (
            <>
              <p className="text-xs font-bold text-[color:var(--muted)] mb-3 mt-2">پاس‌شده / بسته‌شده</p>
              {closed.map(renderCard)}
            </>
          )}
        </>
      )}

      <CreateChequeModal
        key={tab /* با عوض شدن تب، نوع پیش‌فرض فرم هم عوض شود */}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setLoading(true); fetchAll(); }}
        unit={unit}
        currency={currency}
        defaultDirection={tab === "RECEIVABLE" ? "RECEIVABLE" : "PAYABLE"}
      />

      <ClearChequeModal
        key={clearTarget?._id ?? "none"}
        cheque={clearTarget}
        onClose={() => setClearTarget(null)}
        onConfirm={handleConfirmClear}
        display={display}
        unit={unit}
      />
    </PageShell>
  );
}
