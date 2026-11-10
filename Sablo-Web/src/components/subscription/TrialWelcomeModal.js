"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import { useSubscription } from "@/context/subscriptionContext";

const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// کلید «دیده شد» بر اساس تاریخ پایان دورهٔ رایگان است؛ برای هر کاربر یکتاست و نیازی به درخواست اضافه نیست
const seenKey = (endDate) => `trialWelcomeSeen:${endDate}`;

/**
 * پیام خوش‌آمد دورهٔ رایگان: برای هر کاربر فقط یک‌بار، بعد از اینکه وضعیت واقعی از سرور آمد
 * و پلن «trial» بود. فقط در داشبورد نشان داده می‌شود.
 */
export default function TrialWelcomeModal() {
  const { subscription, loaded } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/dashboard" || !loaded) return;
    if (subscription.plan !== "trial" || !subscription.hasAccess) return;
    if (!subscription.daysLeft || subscription.daysLeft <= 0 || !subscription.endDate) return;
    try {
      if (!localStorage.getItem(seenKey(subscription.endDate))) setOpen(true);
    } catch {
      // ذخیره‌سازی خراب است؛ مزاحم کاربر نشو
    }
  }, [pathname, loaded, subscription]);

  const close = (goToPlans) => {
    setOpen(false);
    try { localStorage.setItem(seenKey(subscription.endDate), "1"); } catch {}
    if (goToPlans) router.push("/subscription");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--overlay)]"
      onClick={() => close(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[var(--card)] rounded-3xl p-6 text-center border border-[color:var(--border)]"
      >
        <div className="mx-auto mb-3.5 w-[68px] h-[68px] rounded-full bg-[var(--brand-light)] flex items-center justify-center">
          <Gift size={34} className="text-[color:var(--brand)]" />
        </div>
        <h2 id="trial-title" className="text-[17px] font-extrabold text-[color:var(--ink)]">خوش اومدی! 🎉</h2>
        <p className="mt-2 text-[22px] font-extrabold text-[color:var(--brand)]">
          {toFa(subscription.daysLeft)} روز اشتراک رایگان
        </p>
        <p className="mt-2.5 mb-5 text-[13px] leading-[22px] text-[color:var(--muted)]">
          هدیهٔ سابلو برای تو فعال شد. در این مدت به تمام امکانات دسترسی کامل داری؛ تراکنش ثبت کن،
          وام و اقساطت را مدیریت کن و گزارش‌های مالی‌ات را ببین.
        </p>
        <button
          onClick={() => close(false)}
          className="w-full py-3.5 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-[15px] font-extrabold transition-colors"
        >
          شروع می‌کنم
        </button>
        <button
          onClick={() => close(true)}
          className="mt-1 py-3 text-[13px] font-bold text-[color:var(--brand)]"
        >
          مشاهدهٔ پلن‌ها
        </button>
      </div>
    </div>
  );
}
