"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X, ChevronDown, ChevronUp, Home, Wallet, CreditCard, Landmark, Target,
  BarChart2, Calculator, Bell, Lightbulb, ArrowLeft, ArrowLeftRight,
  PiggyBank, Tag, Banknote, Users, Sparkles,
  FileText
} from "lucide-react";

// ───────── محتوای آموزش (نسخهٔ وب) ─────────
// tone → رنگ آیکن و پس‌زمینه از توکن‌های تم
const TONES = {
  brand:   { fg: "var(--brand)",   bg: "var(--brand-light)" },
  info:    { fg: "var(--info)",    bg: "var(--info-light)" },
  warning: { fg: "var(--warning)", bg: "var(--warning-light)" },
  danger:  { fg: "var(--danger)",  bg: "var(--danger-light)" },
};

const TOPICS = [
  {
    id: "start",
    icon: Home,
    tone: "brand",
    title: "آشنایی با اپ",
    summary: "داشبورد و دسترسی سریع به بخش‌ها",
    steps: [
      "داشبورد: خلاصه‌ی وضعیت مالی، تحلیل هوشمند، انتقال بین کارت‌ها و آخرین تراکنش‌ها.",
      "نوار «دسترسی سریع» زیر داشبورد: گزارش‌های مالی، اهداف، تراکنش‌ها، وام‌ها، طلب و بدهی، بودجه‌بندی، کارت‌ها، محاسبه دنگی و تنظیمات.",
      "تراکنش‌ها: ثبت و جستجوی درآمد، هزینه و قسط.",
      "وام‌ها: ثبت وام و پرداخت اقساط.",
      "گزارش‌ها: نمودار دسته‌بندی هزینه‌ها و مقایسه‌ی ماه‌ها.",
      "اهداف و کارت‌ها: پس‌انداز برای یک هدف مالی و جدا کردن تراکنش‌ها بر اساس کارت یا حساب.",
    ],
    tip: "تنظیمات از آیکون چرخ‌دنده‌ی بالای داشبورد باز می‌شود. دسته‌بندی‌ها، منابع درآمد، بودجه‌بندی، طلب و بدهی، اشتراک، تم روشن/تاریک و یادآوری اقساط آن‌جا هستند.",
  },
  {
    id: "transactions",
    icon: Wallet,
    tone: "brand",
    title: "ثبت تراکنش",
    summary: "درآمد، هزینه و قسط شخصی",
    steps: [
      "در داشبورد روی «ثبت تراکنش جدید» یا در صفحه‌ی «تراکنش‌ها» روی «+ جدید» بزن.",
      "نوع را انتخاب کن: درآمد، خرج یا قسط شخصی.",
      "عنوان و مبلغ را بنویس (مثلاً «حقوق» یا «خرید»).",
      "برای خرج می‌توانی دسته‌بندی انتخاب کنی یا یک دسته‌ی جدید بسازی.",
      "برای درآمد می‌توانی منبع درآمد را انتخاب کنی یا منبع جدید بسازی.",
      "اگر کارت ساخته‌ای، می‌توانی کارت را هم انتخاب کنی.",
      "برای «قسط شخصی» انتخاب تاریخ سررسید الزامی است.",
      "برای ثبت تراکنش قدیمی، تاریخ واقعی‌اش را از بخش «تاریخ تراکنش» انتخاب کن.",
    ],
    tip: "روی هر تراکنش بزن تا جزئیات را ببینی و آن را ویرایش یا حذف کنی. بالای صفحه‌ی تراکنش‌ها هم جستجو و فیلتر تاریخ هست.",
    route: "/transactions",
    routeLabel: "رفتن به تراکنش‌ها",
  },
  {
    id: "cards",
    icon: CreditCard,
    tone: "info",
    title: "مدیریت کارت‌ها",
    summary: "تراکنش‌ها را به تفکیک کارت ببین",
    steps: [
      "در صفحه‌ی «کارت‌ها» روی «کارت جدید» بزن.",
      "نام، رنگ و آیکون کارت را انتخاب کن (حداکثر ۵ کارت).",
      "وقتی یک کارت را فعال می‌کنی، داشبورد و تراکنش‌ها فقط تراکنش‌های همان کارت را نشان می‌دهند.",
      "هنگام حذف کارت انتخاب می‌کنی تراکنش‌هایش بمانند یا همراه کارت حذف شوند.",
    ],
    route: "/cards",
    routeLabel: "رفتن به کارت‌ها",
  },
  {
    id: "transfer",
    icon: ArrowLeftRight,
    tone: "info",
    title: "انتقال بین کارت‌ها",
    summary: "جابه‌جایی پول از یک کارت به کارت دیگر",
    steps: [
      "برای انتقال، حداقل دو کارت لازم است. اگر کمتر داری، اول از صفحه‌ی «کارت‌ها» کارت بساز.",
      "در داشبورد روی «انتقال بین کارت‌ها» بزن.",
      "کارت مبدأ را در بخش «از کارت» و کارت مقصد را در بخش «به کارت» انتخاب کن.",
      "مبلغ را به واحد پول فعلی (تومان یا ریال) وارد کن.",
      "در صورت نیاز یک توضیح کوتاه بنویس (مثلاً «شارژ کارت حقوق») و «ثبت انتقال» را بزن.",
      "انتقال به‌صورت دو تراکنش ثبت می‌شود: «برداشت» از کارت مبدأ و «واریز» به کارت مقصد.",
    ],
    tip: "مبلغ و کارت یک انتقال بعد از ثبت قابل ویرایش نیست. اگر اشتباه شد، یکی از دو تراکنش را حذف کن؛ هر دو سمت انتقال با هم پاک می‌شوند و بعد دوباره ثبت کن.",
    route: "/dashboard",
    routeLabel: "رفتن به داشبورد",
  },
  {
    id: "loans",
    icon: Landmark,
    tone: "warning",
    title: "وام و اقساط",
    summary: "ثبت وام و پرداخت قسط‌ها",
    steps: [
      "در صفحه‌ی «وام‌ها» روی «وام جدید» بزن.",
      "نام وام، مبلغ کل، تعداد اقساط و تاریخ اولین قسط (شمسی) را وارد کن.",
      "اقساط به‌صورت خودکار ساخته می‌شوند.",
      "هر ماه با «پرداخت قسط» قسط را تسویه کن؛ مانده‌ی بدهی و قسط بعدی به‌روز می‌شود.",
    ],
    tip: "اگر یادآوری تلگرام را فعال کنی، سررسید اقساط را به تو یادآوری می‌کند (بخش «یادآورها و اعلان‌ها» همین آموزش).",
    route: "/loans",
    routeLabel: "رفتن به وام‌ها",
  },
  {
    id: "goals",
    icon: Target,
    tone: "brand",
    title: "اهداف مالی",
    summary: "پس‌انداز برای یک هدف",
    steps: [
      "در صفحه‌ی «اهداف» روی «هدف جدید» بزن.",
      "عنوان هدف (مثلاً «پس‌انداز خرید ماشین») و تاریخ هدف (ددلاین) را وارد کن.",
      "هر وقت پولی کنار گذاشتی، روی «+ واریز به این هدف» بزن و مبلغ را ثبت کن؛ می‌توانی کارت را هم انتخاب کنی.",
      "مقدار پس‌انداز‌شده و باقی‌مانده را روی کارت هدف می‌بینی.",
    ],
    route: "/goals",
    routeLabel: "رفتن به اهداف",
  },
  {
    id: "budgets",
    icon: PiggyBank,
    tone: "warning",
    title: "بودجه‌بندی",
    summary: "برای هر دسته یک سقف ماهانه بگذار",
    steps: [
      "از تنظیمات (یا دسترسی سریع داشبورد) «بودجه‌بندی» را باز کن.",
      "روی «بودجه جدید» بزن، یک دسته‌بندی انتخاب کن و سقف ماهانه‌اش را بنویس.",
      "برای هر دسته، مقدار مصرف‌شده، درصد مصرف و مبلغ باقی‌مانده را می‌بینی. اگر از سقف بگذری، مبلغ اضافه نشان داده می‌شود.",
      "برای تغییر سقف یا حذف بودجه، روی کارت همان دسته بزن.",
    ],
    tip: "وقتی مصرف یک دسته به ۸۰٪ و ۱۰۰٪ سقف برسد، در زنگ اعلان‌های داشبورد هشدار می‌گیری.",
    route: "/budgets",
    routeLabel: "رفتن به بودجه‌بندی",
  },
  {
    id: "reports",
    icon: BarChart2,
    tone: "info",
    title: "گزارش‌ها",
    summary: "بفهم پول کجا خرج می‌شود",
    steps: [
      "ماه مورد نظر را بالای صفحه انتخاب کن.",
      "نمودار «توزیع بر اساس دسته‌بندی» سهم هر دسته از هزینه‌ها را نشان می‌دهد.",
      "بخش «مقایسه‌ی ماهانه» درآمد و خرج این ماه را با ماه قبل مقایسه می‌کند.",
      "درآمدها به تفکیک منبع درآمد هم نمایش داده می‌شوند.",
    ],
    tip: "برای اینکه نمودار هزینه‌ها معنی‌دار شود، موقع ثبت هزینه دسته‌بندی را انتخاب کن.",
    route: "/reports",
    routeLabel: "رفتن به گزارش‌ها",
  },
  {
    id: "categories",
    icon: Tag,
    tone: "info",
    title: "مدیریت دسته‌بندی‌ها",
    summary: "دسته‌بندی شخصی خودت را بساز",
    steps: [
      "از تنظیمات «مدیریت دسته‌بندی‌ها» را باز کن.",
      "روی «دسته‌بندی جدید» بزن، یک ایموجی و نام دسته را بنویس (مثلاً «گازوئیل» یا «شهریه»).",
      "با آیکون مداد نام و ایموجی را تغییر بده و با آیکون سطل زباله حذفش کن.",
      "دسته‌بندی‌های پیش‌فرض اپ هم پایین صفحه نشان داده می‌شوند، ولی قابل ویرایش یا حذف نیستند.",
    ],
    tip: "با حذف یک دسته، تراکنش‌هایش به «سایر» منتقل می‌شوند و بودجه‌ی آن دسته هم حذف می‌شود.",
    route: "/categories",
    routeLabel: "رفتن به دسته‌بندی‌ها",
  },
  {
    id: "income-sources",
    icon: Banknote,
    tone: "brand",
    title: "منابع درآمد",
    summary: "درآمدها را به تفکیک منبع ببین",
    steps: [
      "از تنظیمات «مدیریت منابع درآمد» را باز کن.",
      "روی «منبع درآمد جدید» بزن و یک نام بنویس (مثلاً «حقوق»، «اجاره» یا «فریلنس»).",
      "موقع ثبت هر درآمد در تراکنش‌ها، منبعش را انتخاب کن یا «بدون منبع» بگذار.",
      "در گزارش‌ها درآمدها به تفکیک منبع نمایش داده می‌شوند.",
    ],
    route: "/income-sources",
    routeLabel: "رفتن به منابع درآمد",
  },
  {
    id: "obligations",
    icon: Users,
    tone: "warning",
    title: "طلب و بدهی",
    summary: "قرض‌های شخصی بین خودت و آشنایان",
    steps: [
      "از تنظیمات (یا دسترسی سریع داشبورد) «طلب و بدهی» را باز کن و روی «جدید» بزن.",
      "نوع را انتخاب کن: «طلب من» (به کسی قرض دادی) یا «بدهی من» (از کسی قرض گرفتی).",
      "نام شخص، مبلغ و تاریخ را بنویس. عنوان، سررسید و توضیحات اختیاری‌اند.",
      "اگر «روی موجودی من اثر بگذارد» را روشن کنی، قرض و پرداخت‌ها روی موجودی هم اثر می‌گذارند و می‌توانی کارت را هم انتخاب کنی.",
      "برای هر پرداخت یا دریافت، روی «ثبت پرداخت» یا «ثبت دریافت» بزن. با «تسویه کامل» کل باقی‌مانده یک‌جا بسته می‌شود.",
      "بالای صفحه مجموع بدهی، طلب و تراز کلی را می‌بینی و مواردی که از سررسیدشان گذشته مشخص‌اند.",
    ],
    tip: "گزینه‌ی «اثر روی موجودی» و کارت بعد از ثبت قابل تغییر نیستند. اگر اشتباه شد، آن مورد را حذف و دوباره ثبت کن.",
    route: "/obligations",
    routeLabel: "رفتن به طلب و بدهی",
  },
  {
    id: "ai",
    icon: Sparkles,
    tone: "brand",
    title: "تحلیل هوشمند",
    summary: "بررسی وضعیت مالی با هوش مصنوعی",
    steps: [
      "در داشبورد، کارت «تحلیل هوشمند وضعیت مالی» را پیدا کن.",
      "روی «بررسی» بزن تا تحلیل وضعیت مالی‌ات نمایش داده شود.",
      "هر روز یک بار می‌توانی از این قابلیت استفاده کنی. نتیجه‌ی آخرین تحلیل همان‌جا می‌ماند.",
    ],
    tip: "هر چه تراکنش‌ها و دسته‌بندی‌های دقیق‌تری ثبت کرده باشی، تحلیل مفیدتری می‌گیری.",
    route: "/dashboard",
    routeLabel: "رفتن به داشبورد",
  },
  {
    id: "dong",
    icon: Calculator,
    tone: "info",
    title: "محاسبه‌ی دنگی",
    summary: "تقسیم هزینه‌ی گروهی",
    steps: [
      "از نوار «دسترسی سریع» داشبورد «محاسبه دنگی» را باز کن.",
      "با «افزودن شخص» اعضای گروه را اضافه کن و مبلغی که هر نفر پرداخته را بنویس.",
      "سهم مساوی هر نفر و فهرست «چه کسی به چه کسی چقدر بدهد» خودکار حساب می‌شود.",
      "در پایان انتخاب کن «تو کدام نفری؟» و سهم خودت را به‌عنوان هزینه ثبت کن.",
    ],
    route: "/dong",
    routeLabel: "رفتن به محاسبه دنگی",
  },
  {
    id: "reminders",
    icon: Bell,
    tone: "warning",
    title: "یادآورها و اعلان‌ها",
    summary: "برای دریافت اعلان، ربات تلگرام را فعال کن",
    steps: [
      "برای دریافت اعلان‌ها حتماً باید ربات تلگرام سابلو را فعال کنی؛ بدون آن یادآوری‌ها به تلگرامت نمی‌رسند.",
      "از تنظیمات «یادآوری سررسید اقساط» را باز کن و روی «رفتن به ربات تلگرام» بزن (نیاز به حساب تلگرام دارد).",
      "در ربات «شروع / Start» را بزن و شماره موبایلی که با آن در سابلو ثبت‌نام کرده‌ای را دقیقاً همان‌طور وارد کن.",
      "بعد از فعال‌سازی، سررسید اقساط وام و قسط‌های شخصی و هشدار بودجه (وقتی مصرف یک دسته به ۸۰٪ و ۱۰۰٪ سقف برسد) را دریافت می‌کنی.",
      "همین اعلان‌ها داخل برنامه هم در زنگ بالای داشبورد دیده می‌شوند؛ با تیک کنار هر اعلان آن را «خوانده‌شده» کن.",
    ],
    tip: "ربات را بلاک یا حذف نکن (گزینه‌ی «Stop and block bot» را نزن)، وگرنه اعلان‌های تلگرامی قطع می‌شوند.",
    route: "/settings",
    routeLabel: "رفتن به تنظیمات",
  },
  {
  id: "cheques",
  icon: FileText,
  tone: "warning",
  title: "چک‌ها",
  summary: "چک‌های پرداختی و دریافتی با سررسید",
  steps: [
    "از تنظیمات (یا دسترسی سریع داشبورد) «چک‌ها» را باز کن و روی «جدید» بزن.",
    "نوع را انتخاب کن: «پرداختی» (چک دادی) یا «دریافتی» (چک گرفتی).",
    "مبلغ و تاریخ سررسید را بنویس. بانک، شماره چک، طرف حساب و یادداشت اختیاری‌اند.",
    "ثبت چک روی موجودی اثر ندارد. وقتی «پاس شد» یا «وصول شد» را بزنی، کارت را انتخاب می‌کنی و یک تراکنش ساخته می‌شود.",
    "اگر چکی برگشت خورد، «برگشت خورد» را بزن. هر وقت لازم بود می‌توانی چک را به «در جریان» برگردانی.",
    "بالای صفحه مجموع پرداختی و دریافتی در جریان و خالص را می‌بینی و چک‌های گذشته از سررسید مشخص‌اند.",
  ],
  tip: "تراکنش چکِ پاس‌شده جزو درآمد و هزینه‌ی ماه حساب نمی‌شود و فقط موجودی را تغییر می‌دهد. با برگرداندن چک به «در جریان» یا حذفش، همان تراکنش هم حذف می‌شود.",
  route: "/cheques",
  routeLabel: "رفتن به چک‌ها",
}
];

const toPersianNum = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ───────── کامپوننت ─────────
export default function TutorialModal({ open, onClose }) {
  const router = useRouter();
  const [openId, setOpenId] = useState(TOPICS[0].id);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const goTo = (route) => {
    onClose();
    router.push(route);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--overlay)] backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="آموزش استفاده از اپ"
        className="flex flex-col w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] bg-[var(--card)] rounded-t-3xl sm:rounded-3xl overflow-hidden border border-[color:var(--border)] shadow-xl"
      >
        {/* هدر */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[color:var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[color:var(--ink)]">آموزش استفاده از اپ</h2>
            <p className="text-xs text-[color:var(--muted)] mt-0.5">روی هر بخش بزن تا مراحلش باز شود</p>
          </div>
          <button onClick={onClose} aria-label="بستن" className="p-1.5 rounded-full hover:bg-[var(--hover)] transition-colors">
            <X size={22} className="text-[color:var(--muted)]" />
          </button>
        </div>

        {/* لیست */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const t = TONES[topic.tone];
            const isOpen = openId === topic.id;

            return (
              <div key={topic.id} className="bg-[var(--bg)] rounded-[14px] border border-[color:var(--border)] overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : topic.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-right hover:bg-[var(--hover)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: t.bg, color: t.fg }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[color:var(--ink)]">{topic.title}</div>
                    <div className="text-[11px] text-[color:var(--muted)] mt-0.5">{topic.summary}</div>
                  </div>
                  {isOpen
                    ? <ChevronUp size={18} className="text-[color:var(--muted)] shrink-0" />
                    : <ChevronDown size={18} className="text-[color:var(--muted)] shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-[color:var(--border)] space-y-2.5">
                    {topic.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 mt-1.5">
                        <span
                          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-px"
                          style={{ background: t.bg, color: t.fg }}>
                          {toPersianNum(idx + 1)}
                        </span>
                        <p className="flex-1 text-[13px] leading-[21px] text-[color:var(--ink)]">{step}</p>
                      </div>
                    ))}

                    {topic.tip && (
                      <div className="flex items-start gap-2 bg-[var(--warning-light)] rounded-[10px] px-2.5 py-2">
                        <Lightbulb size={14} className="text-[color:var(--warning)] shrink-0 mt-0.5" />
                        <p className="flex-1 text-xs leading-[19px] text-[color:var(--warning)]">{topic.tip}</p>
                      </div>
                    )}

                    {topic.route && (
                      <button
                        type="button"
                        onClick={() => goTo(topic.route)}
                        className="w-full flex items-center justify-center gap-1.5 border rounded-xl py-2.5 text-[13px] font-bold hover:bg-[var(--hover)] transition-colors"
                        style={{ borderColor: t.fg, color: t.fg }}>
                        {topic.routeLabel}
                        <ArrowLeft size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
