import { AlertTriangle, Wallet, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: <AlertTriangle size={24} />,
    value: "۸۷٪",
    title: "ناتوانی در پس‌انداز",
    text: "افرادی که دخل و خرج خود را نمی‌نویسند، ماهانه حداقل ۳۰٪ از درآمد خود را بدون اینکه متوجه شوند، هدر می‌دهند.",
    card: "bg-gradient-to-b from-rose-50/70 to-white",
    iconBox: "bg-rose-100/70 text-rose-600 ring-8 ring-rose-50",
    valueColor: "text-rose-700",
  },
  {
    icon: <Wallet size={24} />,
    value: "تراز منفی",
    title: "سردرگمی وام و قسط",
    text: "در برنامه‌های معمولی، وقتی وام می‌گیری چون پول وارد حسابت شده سیستم فکر می‌کند درآمد داری و بعد از خرج شدنش گیج می‌شوی!",
    card: "bg-gradient-to-b from-amber-50/70 to-white",
    iconBox: "bg-amber-100/70 text-amber-600 ring-8 ring-amber-50",
    valueColor: "text-amber-700",
  },
  {
    icon: <TrendingUp size={24} />,
    value: "+۴۰٪",
    title: "رشد مالی با سیستم هوشمند",
    text: "کاربران ما پس از ۳۰ روز استفاده از سیستم حسابداری دقیق، توانسته‌اند هزینه‌های اضافی خود را تا چهل درصد کنترل کنند.",
    card: "bg-gradient-to-b from-emerald-50/70 to-white",
    iconBox: "bg-emerald-100/70 text-emerald-600 ring-8 ring-emerald-50",
    valueColor: "text-emerald-700",
  },
];

export default function StatsSection() {
  return (
    <section
      id="stats"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
    >
      {stats.map((s) => (
        <div
          key={s.title}
          className={`${s.card} p-7 rounded-3xl border border-[#EDE8DC]/80 text-center shadow-[0_10px_30px_-15px_rgba(26,25,22,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-14px_rgba(26,25,22,0.2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
        >
          <div
            className={`w-12 h-12 mx-auto ${s.iconBox} rounded-full flex items-center justify-center mb-5`}
          >
            {s.icon}
          </div>
          <h3 className={`text-2xl font-extrabold ${s.valueColor} tabular mb-2`}>
            {s.value}
          </h3>
          <span className="text-xs font-semibold block text-[#26241F] mb-3">
            {s.title}
          </span>
          <p className="text-[11px] text-[#8A8273] leading-6">{s.text}</p>
        </div>
      ))}
    </section>
  );
}
