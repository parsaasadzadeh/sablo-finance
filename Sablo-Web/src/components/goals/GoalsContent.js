"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Target, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { useCurrency } from "@/context/currencyContext";
import { useCard } from "@/context/cardContext";
import { useTheme } from "@/context/themeContext";
import GoalCard from "@/components/reports/GoalCard";
import DepositToGoalModal from "@/components/reports/DepositToGoalModal";
import { alertError } from "@/utils/apiError";

const LABEL = "block text-xs font-medium text-[color:var(--ink-light)] mb-1.5 text-right";
const INPUT =
  "w-full text-sm bg-[var(--input-bg)] border border-[color:var(--input-border)] rounded-xl px-3.5 py-2.5 outline-none focus:border-[color:var(--brand)] text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)] text-right";

export default function GoalsContent() {
  const router = useRouter();
  const { display, unit, currency } = useCurrency();
  const { cards } = useCard();
  const { mode } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  // هدفی که مودال واریز برایش باز است
  const [depositGoal, setDepositGoal] = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data.goals);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title || !amount || !deadline) {
      setError("همه فیلدها الزامی هستند");
      return;
    }
    const numericAmount = Number(amount.replace(/,/g, ""));
    const amountInRial = currency === "IRT" ? numericAmount * 10 : numericAmount;
    // deadline یک آبجکت Date هست (از DatePicker شمسی) — قبل از ارسال به ISO تبدیل میشه
    const formattedDeadline = new Date(deadline).toISOString();
    setFormLoading(true);
    try {
      await api.post("/goals", { title, targetAmount: amountInRial, deadline: formattedDeadline });
      setTitle(""); setAmount(""); setDeadline("");
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || "خطایی رخ داد");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هدف حذف شود؟")) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      alertError(err, "خطا در حذف هدف");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[color:var(--brand)]" size={32} />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)] p-4 sm:p-8 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: var(--amber-bg) !important; color: var(--ink) !important; border: 1px solid var(--warning-border) !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; text-align: right !important; }
        .rmdp-input:focus { border-color: var(--brand) !important; box-shadow: none !important; }
        .rmdp-input::placeholder { color: var(--muted-light); }
      `}</style>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
          >
            <ArrowRight size={16} /> بازگشت
          </button>
          <h1 className="text-xl font-bold text-[color:var(--ink)]">اهداف مالی</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} /> هدف جدید
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-5 mb-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-[color:var(--ink)] text-right">هدف مالی جدید</h3>
            <div>
              <label className={LABEL}>عنوان</label>
              <input
                type="text"
                placeholder="مثال: پس‌انداز خرید ماشین"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>مبلغ هدف ({unit})</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={`مبلغ را به ${unit} وارد کنید`}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--amber-text)] mb-1.5 text-right">
                ددلاین (شمسی)
              </label>
              <DatePicker
                className={mode === "dark" ? "bg-dark" : ""}
                calendar={persian}
                locale={persian_fa}
                value={deadline}
                onChange={(dateObject) => setDeadline(dateObject?.isValid ? dateObject.toDate() : "")}
                minDate={new Date()}
                calendarPosition="bottom-right"
                placeholder="انتخاب تاریخ"
              />
            </div>
            {error && <p className="text-xs text-[color:var(--danger)] text-right">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {formLoading && <Loader2 size={14} className="animate-spin" />}
                ذخیره هدف
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Target size={48} className="text-[color:var(--muted-light)] opacity-50" />
            <h3 className="text-base font-bold text-[color:var(--ink)]">هنوز هدفی ندارید</h3>
            <p className="text-sm text-[color:var(--muted)] text-center max-w-xs leading-6">
              با تعریف هدف مالی، اپ پیشرفت شما رو دنبال میکنه و پیش‌بینی میده
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-sm font-semibold px-6 py-3 rounded-xl mt-2 transition-colors"
            >
              اولین هدفم رو بسازم
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              display={display}
              unit={unit}
              onDelete={handleDelete}
              onDeposit={setDepositGoal}
            />
          ))
        )}
      </div>
      {/* واریز به هدف — مودال اختصاصی (معادل DepositToGoalModal در موبایل) */}
      <DepositToGoalModal
        key={depositGoal?._id ?? "closed"}
        visible={Boolean(depositGoal)}
        onClose={() => setDepositGoal(null)}
        onSuccess={fetchGoals}
        goalId={depositGoal?._id}
        goalTitle={depositGoal?.title ?? ""}
        unit={unit}
        currency={currency}
        cards={cards}
        remaining={depositGoal?.remaining}
        display={display}
      />
    </div>
  );
}
