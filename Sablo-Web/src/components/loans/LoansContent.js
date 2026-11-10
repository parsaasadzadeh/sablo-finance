"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Loader2, Landmark } from "lucide-react";
import api from "@/lib/axios";
import { useCurrency } from "@/context/currencyContext";
import LoanCard from "./LoanCard";
import CreateLoanModal from "./CreateLoanModal";
import { alertError } from "@/utils/apiError";

export default function LoansContent() {
  const router = useRouter();
  const { display, unit } = useCurrency();

  const [loans,       setLoans]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLoans = useCallback(async () => {
    try {
      const res = await api.get("/finance/loans");
      setLoans(res.data.loans ?? []);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  // انتخاب کارت داخل LoanCard انجام می‌شود و اینجا فقط پرداخت با (id, cardId) اجرا می‌شود
  const handlePay = useCallback(async (installmentId, cardId) => {
    try {
      await api.put(`/finance/pay-installment/${installmentId}`, {
        cardId: cardId ?? null,
      });
      fetchLoans();
    } catch (err) {
      alertError(err, "خطا در پرداخت قسط");
    }
  }, [fetchLoans]);

  const handleDelete = async (loan) => {
    if (!window.confirm(
      `آیا مطمئنید می‌خواهید وام «${loan.title}» را حذف کنید؟\nتمام اقساط مرتبط هم حذف خواهند شد.`
    )) return;
    try {
      await api.delete(`/finance/delete/${loan._id}`);
      fetchLoans();
    } catch (err) {
      alertError(err, "خطا در حذف وام");
    }
  };

  const totalDebt   = loans.reduce((s, l) => s + l.remainingAmount, 0);
  const totalPaid   = loans.reduce((s, l) => s + l.paidAmount, 0);
  const activeCount = loans.filter((l) => !l.isFullyPaid).length;
  const activeLoans = loans.filter((l) => !l.isFullyPaid);
  const paidLoans   = loans.filter((l) => l.isFullyPaid);

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
      `}</style>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">

        {/* هدر */}
        <div className="flex items-center mb-5">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <ArrowRight size={15} /> بازگشت
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-[color:var(--ink)]">وام‌های من</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-[var(--brand)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
          >
            <Plus size={14} /> وام جدید
          </button>
        </div>

        {/* خلاصه کلی */}
        {!loading && loans.length > 0 && (
          <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4 mb-5">
            <div className="flex gap-3">
              <div className="flex-1 text-center">
                <p className="text-[11px] text-[color:var(--muted)] mb-1">بدهی باقیمانده</p>
                <p className="text-sm font-extrabold text-[color:var(--rose-mid)]">{display(totalDebt)} {unit}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[11px] text-[color:var(--muted)] mb-1">پرداخت شده</p>
                <p className="text-sm font-extrabold text-[color:var(--emerald-mid)]">{display(totalPaid)} {unit}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[11px] text-[color:var(--muted)] mb-1">وام فعال</p>
                <p className="text-sm font-extrabold text-[color:var(--brand)]">{activeCount} وام</p>
              </div>
            </div>
          </div>
        )}

        {/* محتوا */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[color:var(--brand)]" size={28} />
          </div>
        ) : loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-[var(--border)] rounded-full flex items-center justify-center">
              <Landmark size={28} className="text-[color:var(--muted)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[color:var(--ink)] mb-1">هنوز وامی ثبت نشده</p>
              <p className="text-xs text-[color:var(--muted)]">
                وام‌های بانکی رو اینجا ثبت کن تا اقساطشون خودکار مدیریت بشه
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--brand)] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
            >
              ثبت اولین وام
            </button>
          </div>
        ) : (
          <>
            {activeLoans.map((loan) => (
              <LoanCard key={loan._id} loan={loan} display={display} unit={unit}
                onPay={handlePay} onDelete={handleDelete} />
            ))}
            {paidLoans.length > 0 && (
              <>
                <p className="text-xs font-bold text-[color:var(--muted)] text-right mb-3 mt-2">تسویه‌شده‌ها</p>
                {paidLoans.map((loan) => (
                  <LoanCard key={loan._id} loan={loan} display={display} unit={unit}
                    onPay={handlePay} onDelete={handleDelete} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <CreateLoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => { setLoading(true); fetchLoans(); }}
      />
    </div>
  );
}
