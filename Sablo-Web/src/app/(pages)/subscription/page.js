"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Crown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useSubscription } from "@/context/subscriptionContext";
import { errorText } from "@/utils/apiError";

const toFa = (v) => String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const formatPrice = (n) => toFa(n.toLocaleString("en-US"));
const discountPercent = (oldP, p) => Math.round(((oldP - p) / oldP) * 100);
// قیمت معادل ماهانه، رُند‌شده به صدتومان
const perMonth = (price, months) => Math.round(price / months / 100) * 100;

/* قیمت‌ها به «تومان»؛ باید با پلن‌های اپ و SKUهای پنل مایکت یکی باشند */
const PLANS = [
  { id: "sablo_monthly",  label: "ماهانه", price: 22000,  oldPrice: null,   period: "ماه",   months: 1,  badge: null,           highlight: null },
  { id: "sablo_biannual", label: "۶ ماهه", price: 119000, oldPrice: 132000, period: "۶ ماه", months: 6,  badge: null,           highlight: null },
  { id: "sablo_annual",   label: "سالانه", price: 169000, oldPrice: 264000, period: "سال",   months: 12, badge: "بهترین ارزش", highlight: "۴ ماه رایگان 🎁" },
];
const DEFAULT_PLAN_ID = "sablo_annual";

const FEATURES = [
  "ثبت نامحدود تراکنش",
  "مدیریت وام و اقساط",
  "مدیریت کارت‌های بانکی",
  "انتقال پول بین کارت‌ها",
  "مدیریت دسته‌بندی هزینه‌ها",
  "مدیریت منابع درآمد",
  "بودجه‌بندی ماهانه با هشدار مصرف",
  "ثبت و پیگیری طلب و بدهی",
  "نمودار و گزارش مالی",
  "مقایسهٔ ماهانه درآمد و هزینه",
  "خروجی اکسل",
  "یادآور قسط، بودجه و بدهی‌ها",
  "برنامه‌ریزی مالی و اهداف پس‌انداز",
  "تحلیل هوشمند رفتار مصرفی",
  "رادار مالی هوشمند",
  "محاسبه دنگ و تقسیم هزینه‌ها",
  "ثبت نامحدود چک و پیگیری سررسید"
];

const PLAN_NAMES = { trial: "دوره رایگان", monthly: "ماهانه", biannual: "۶ ماهه", annual: "سالانه" };

/* نتیجهٔ بازگشت از مایکت: بک‌اند با ?result=... به همین صفحه ریدایرکت می‌کند */
const RESULTS = {
  success: { ok: true,  text: "اشتراک شما با موفقیت فعال شد. ممنون که از سابلو حمایت می‌کنید 💚" },
  failed:  { ok: false, text: "پرداخت انجام نشد یا لغو شد. اگر مبلغی کسر شده، چند دقیقه صبر کنید و با پشتیبانی تماس بگیرید." },
  invalid: { ok: false, text: "اطلاعات بازگشت از پرداخت معتبر نبود. اگر مبلغی کسر شده با پشتیبانی تماس بگیرید." },
  error:   { ok: false, text: "فعال‌سازی اشتراک با خطا مواجه شد. اگر مبلغی کسر شده با پشتیبانی تماس بگیرید." },
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { subscription, loaded, refetch } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_PLAN_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // این صفحه فقط برای کاربر واردشده است
    let token = null;
    try { token = localStorage.getItem("token"); } catch {}
    if (!token) { router.replace("/login"); return; }

    // نتیجهٔ بازگشت از مایکت را بخوان و از آدرس پاک کن (با رفرش دوباره نشان داده نشود)
    const r = new URLSearchParams(window.location.search).get("result");
    if (r && RESULTS[r]) {
      setResult(RESULTS[r]);
      window.history.replaceState(null, "", "/subscription");
    }
    refetch(); // وضعیت تازه (بعد از خرید موفق)
    setReady(true);
  }, [router, refetch]);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post("/subscription/web/start", { skuId: selectedPlan });
      if (!res.data?.url) throw new Error("no url");
      // رفتن به صفحهٔ پرداخت مایکت؛ بعد از پرداخت مایکت کاربر را به همین صفحه برمی‌گرداند
      window.location.href = res.data.url;
    } catch (err) {
      setError(errorText(err, "شروع پرداخت با خطا مواجه شد. دوباره تلاش کنید."));
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[color:var(--brand)]" size={36} />
      </div>
    );
  }

  const hasPlanInfo = loaded && subscription.plan && subscription.hasAccess;

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[var(--bg)] text-[color:var(--ink)]">
      <main className="max-w-xl mx-auto px-4 py-6 pb-12">
        <Link
          href="/dashboard"
          aria-label="بازگشت"
          className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-[var(--card)] border border-[color:var(--border)] hover:bg-[var(--hover)]"
        >
          <ArrowRight size={20} />
        </Link>

        <div className="flex flex-col items-center text-center my-5">
          <Crown size={48} className="text-amber-500" />
          <h1 className="mt-2 text-2xl font-extrabold">سابلو پریمیوم</h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">دسترسی کامل به تمام امکانات</p>
        </div>

        {result && (
          <div
            role="status"
            className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 mb-4 text-sm leading-6 ${
              result.ok
                ? "bg-[var(--emerald-bg)] border-[color:var(--emerald-mid)]/40 text-[color:var(--emerald-text)]"
                : "bg-[var(--danger-light)] border-[color:var(--danger-border)] text-[color:var(--danger)]"
            }`}
          >
            {result.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <span>{result.text}</span>
          </div>
        )}

        {hasPlanInfo && (
          <div className="rounded-2xl bg-[var(--brand-light)] text-[color:var(--brand)] text-sm font-bold text-center py-3 mb-4">
            {subscription.plan === "trial"
              ? `دوره رایگان — ${toFa(subscription.daysLeft ?? 0)} روز مانده`
              : `اشتراک ${PLAN_NAMES[subscription.plan] ?? subscription.plan} — ${toFa(subscription.daysLeft ?? 0)} روز مانده`}
          </div>
        )}

        <div className="rounded-2xl bg-[var(--card)] border border-[color:var(--border)] p-4 mb-5">
          <ul className="grid gap-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-base font-bold mb-3">پلن خود را انتخاب کنید</h2>
        <div className="grid gap-3" role="radiogroup" aria-label="پلن اشتراک">
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedPlan(plan.id)}
                className={`text-right rounded-2xl border-2 p-4 transition-colors bg-[var(--card)] ${
                  active ? "border-[color:var(--brand)] bg-[var(--brand-light)]" : "border-[color:var(--border)] hover:bg-[var(--hover)]"
                }`}
              >
                {(plan.badge || plan.oldPrice) && (
                  <div className="flex items-center gap-2 mb-2">
                    {plan.oldPrice && (
                      <span className="text-[11px] font-bold rounded-md px-2 py-0.5 bg-[var(--rose-bg)] text-[color:var(--rose-text)]">
                        {toFa(discountPercent(plan.oldPrice, plan.price))}٪ تخفیف
                      </span>
                    )}
                    {plan.badge && (
                      <span className="text-[11px] font-bold rounded-md px-2 py-0.5 bg-[var(--brand)] text-white">{plan.badge}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-extrabold">{plan.label}</div>
                    {plan.highlight && <div className="text-xs font-semibold text-[color:var(--brand)] mt-0.5">{plan.highlight}</div>}
                    {plan.months > 1 && (
                      <div className="text-xs text-[color:var(--muted)] mt-0.5">ماهانه {formatPrice(perMonth(plan.price, plan.months))} تومان</div>
                    )}
                  </div>
                  <div className="text-left shrink-0">
                    {plan.oldPrice && (
                      <div className="text-xs text-[color:var(--muted)] line-through">{formatPrice(plan.oldPrice)}</div>
                    )}
                    <div className="text-lg font-extrabold text-[color:var(--brand)]">
                      {formatPrice(plan.price)} <span className="text-xs font-semibold">تومان / {plan.period}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error && <p role="alert" className="mt-4 text-sm font-semibold text-[color:var(--danger)] text-center">{error}</p>}

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="mt-5 w-full py-4 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white text-base font-extrabold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "پرداخت با مایکت"}
        </button>

        <p className="mt-4 text-xs text-center leading-5 text-[color:var(--muted)]">
          پرداخت در صفحهٔ امن مایکت انجام می‌شود و بعد از تکمیل، به همین صفحه برمی‌گردید و اشتراک شما خودکار فعال می‌شود.
        </p>
      </main>
    </div>
  );
}
