"use client";
import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { useSubscription } from "@/context/subscriptionContext";

const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

function Bar({ tone, icon: Icon, title, sub, cta }) {
  const tones = {
    danger: "bg-[var(--danger-light)] border-[color:var(--danger-border)] text-[color:var(--danger)]",
    warning: "bg-[var(--warning-light)] border-[color:var(--warning-border)] text-[color:var(--warning)]",
    info: "bg-[var(--brand-light)] border-[color:var(--brand)]/30 text-[color:var(--brand)]",
  };
  return (
    <Link
      href="/subscription"
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 mb-4 transition-opacity hover:opacity-90 ${tones[tone]}`}
    >
      <Icon size={18} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs opacity-80">{sub}</div>
      </div>
      <span className="text-xs font-bold shrink-0">{cta} ←</span>
    </Link>
  );
}

export default function SubscriptionBanner() {
  const { subscription: s, loaded } = useSubscription();

  // تا وضعیت واقعی از سرور نیامده هیچ بنری نشان نده
  if (!loaded || (s.hasAccess && s.daysLeft === null)) return null;

  if (!s.hasAccess) {
    return <Bar tone="danger" icon={AlertCircle} title="اشتراک شما به پایان رسیده" sub="برای ادامهٔ ثبت اطلاعات، اشتراک تهیه کنید" cta="خرید" />;
  }

  if (s.plan !== "trial" && s.daysLeft <= 3) {
    return (
      <Bar
        tone="warning"
        icon={Clock}
        title={s.daysLeft === 0 ? "اشتراک شما امروز تمام می‌شود" : `${toFa(s.daysLeft)} روز تا پایان اشتراک`}
        sub="برای تمدید کلیک کنید"
        cta="تمدید"
      />
    );
  }

  if (s.plan === "trial" && s.daysLeft <= 5) {
    return (
      <Bar
        tone="info"
        icon={Clock}
        title={`${toFa(s.daysLeft)} روز از دورهٔ رایگان مانده`}
        sub="اشتراک بخر، بدون وقفه ادامه بده"
        cta="خرید"
      />
    );
  }

  return null;
}
