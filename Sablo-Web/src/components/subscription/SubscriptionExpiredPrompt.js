"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { useSubscription } from "@/context/subscriptionContext";
import { onSubscriptionExpired } from "@/lib/subscriptionBus";

// حداقل فاصلهٔ دو بار نمایش (چند درخواست هم‌زمان چند پنجره نسازند)
const COOLDOWN_MS = 60_000;

/**
 * جایگزین خطای خام/ریدایرکت اجباری: وقتی سرور بگوید اشتراک تمام شده، یک پیام آرام نشان می‌دهیم
 * و انتخاب با کاربر است (خرید یا «بعداً»).
 */
export default function SubscriptionExpiredPrompt() {
  const router = useRouter();
  const pathname = usePathname();
  const { refetch } = useSubscription();
  const [open, setOpen] = useState(false);
  const lastRef = useRef(0);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(
    () =>
      onSubscriptionExpired(() => {
        refetch(); // بنر و تنظیمات هم با وضعیت واقعی هماهنگ شوند
        if (pathRef.current?.startsWith("/subscription")) return;
        const now = Date.now();
        if (now - lastRef.current < COOLDOWN_MS) return;
        lastRef.current = now;
        setOpen(true);
      }),
    [refetch]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[var(--overlay)]" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expired-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[var(--card)] rounded-3xl p-6 text-center border border-[color:var(--border)]"
      >
        <div className="mx-auto mb-3.5 w-16 h-16 rounded-full bg-[var(--amber-bg)] flex items-center justify-center">
          <Crown size={30} className="text-[color:var(--amber-mid)]" />
        </div>
        <h2 id="expired-title" className="text-lg font-extrabold text-[color:var(--ink)]">اشتراکت تموم شده</h2>
        <p className="mt-2.5 mb-5 text-[13px] leading-[22px] text-[color:var(--muted)]">
          برای ثبت و ویرایش اطلاعات باید اشتراک داشته باشی. اطلاعات قبلی‌ات سر جاشه و با تمدید،
          همه‌چیز مثل قبل ادامه پیدا می‌کنه.
        </p>
        <button
          onClick={() => { setOpen(false); router.push("/subscription"); }}
          className="w-full py-3.5 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-[15px] font-extrabold transition-colors"
        >
          مشاهدهٔ پلن‌ها
        </button>
        <button onClick={() => setOpen(false)} className="mt-1 py-3 text-[13px] font-bold text-[color:var(--muted)]">
          بعداً
        </button>
      </div>
    </div>
  );
}
