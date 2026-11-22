"use client";
import { Zap, PenLine, ScanSearch, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { toPersianNum } from "@/utils/formatters";
import { EXAMPLES, TIPS } from "./constants";

const STEPS = [
  { Icon: PenLine, title: "بنویس", desc: "خرج یا درآمدت رو مثل پیام دادن به یه دوست بنویس." },
  { Icon: ScanSearch, title: "هوش مصنوعی می‌فهمه", desc: "مبلغ، نوع، دسته‌بندی و تاریخ رو تشخیص میده و یه پیش‌نویس نشونت میده." },
  { Icon: SlidersHorizontal, title: "چک کن", desc: "اگه چیزی اشتباه بود، نوع، دسته‌بندی یا کارت رو همون‌جا عوض کن." },
  { Icon: CheckCircle2, title: "تأیید کن", desc: "با زدن «ثبت تراکنش» ذخیره میشه. تا تأیید نکنی هیچی ثبت نمیشه." },
];

export default function GuideCard({ onPickExample, disabled }) {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[color:var(--border)] p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--brand)] flex items-center justify-center shrink-0">
          <Zap size={20} className="text-white" fill="currentColor" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-[color:var(--ink)]">ثبت تراکنش با سرعت نور</h2>
          <p className="text-[11px] text-[color:var(--muted)] mt-0.5">در ۴ قدم ساده، بدون پر کردن فرم</p>
        </div>
      </div>

      <ol className="space-y-3">
        {STEPS.map(({ Icon, title, desc }, i) => (
          <li key={title} className="flex gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[var(--brand-light)] text-[color:var(--brand)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {toPersianNum(i + 1)}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Icon size={14} className="text-[color:var(--brand)]" />
                <span className="text-[13px] font-bold text-[color:var(--ink)]">{title}</span>
              </div>
              <p className="text-xs leading-[19px] text-[color:var(--ink-light)] mt-0.5">{desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs font-bold text-[color:var(--ink)] mt-4 mb-2">یکی از مثال‌ها رو بزن تا امتحان کنی 👇</p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={disabled}
            onClick={() => onPickExample(ex)}
            className="bg-[var(--brand-light)] text-[color:var(--brand)] text-xs font-semibold rounded-2xl px-3 py-2 text-right transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      <p className="text-xs font-bold text-[color:var(--ink)] mt-4 mb-1.5">نکته‌ها</p>
      <ul className="space-y-1">
        {TIPS.map((t) => (
          <li key={t} className="text-xs leading-5 text-[color:var(--muted)]">• {t}</li>
        ))}
      </ul>
    </div>
  );
}
