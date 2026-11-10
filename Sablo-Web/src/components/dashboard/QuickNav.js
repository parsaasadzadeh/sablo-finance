"use client";
import Link from "next/link";
import { BarChart2, Target, ArrowLeftRight, Landmark, CreditCard, Settings, PiggyBank, Users, Calculator,FileText } from "lucide-react";

const ITEMS = [
  { label: "گزارش‌های مالی", icon: BarChart2, path: "/reports" },
  { label: "اهداف مالی", icon: Target, path: "/goals" },
  { label: "تراکنش‌ها", icon: ArrowLeftRight, path: "/transactions" },
  { label: "وام‌ها", icon: Landmark, path: "/loans" },
  { label: "طلب و بدهی", icon: Users, path: "/obligations" },
  { label: "بودجه‌بندی", icon: PiggyBank, path: "/budgets" },
  { label: "چک‌ها", icon: FileText, path: "/cheques" },
  { label: "محاسبه دنگی", icon: Calculator, path: "/dong" },
  { label: "کارت‌ها", icon: CreditCard, path: "/cards" },
  { label: "تنظیمات", icon: Settings, path: "/settings" }
];

export default function QuickNav() {
  return (
    <nav
      aria-label="دسترسی سریع"
      className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] px-4 py-3 mb-4"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            prefetch
            className="flex items-center gap-1.5 bg-[var(--bg)] hover:bg-[var(--brand-light)] hover:text-[color:var(--brand)] text-[color:var(--ink)] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-[color:var(--border)] focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
          >
            <item.icon size={13} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}