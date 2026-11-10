import Link from "next/link";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  HelpCircle,
  Clock3,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  ArrowLeft
} from "lucide-react";

// چهار نوع تراکنشی که سابلو دنبالشون می‌کنه - همون زبان بصری داشبورد، اینجا برای روایت داستان استفاده شده
const TRACK_ITEMS = [
  {
    Icon: ArrowUpCircle,
    label: "درآمدها",
    color: "bg-emerald-50 text-emerald-700",
    desc: "هر چی وارد جیبتون می‌شه، یک‌جا و شفاف."
  },
  {
    Icon: ArrowDownCircle,
    label: "مخارج",
    color: "bg-rose-50 text-rose-700",
    desc: "خرج‌های روزمره، دسته‌بندی‌شده و قابل پیگیری."
  },
  {
    Icon: Clock3,
    label: "اقساط",
    color: "bg-orange-50 text-orange-700",
    desc: "سررسیدها یادتون نمی‌ره، ما یادآوری می‌کنیم."
  },
  {
    Icon: HelpCircle,
    label: "وام‌ها",
    color: "bg-blue-50 text-blue-700",
    desc: "بدهی‌هاتون رو با عدد و رقم دقیق می‌بینید."
  }
];

const VALUES = [
  {
    Icon: Sparkles,
    title: "ساده، نه ساده‌انگارانه",
    desc: "قرار نبود یک اکسل پیچیده یا یک اپ حسابداری سنگین بسازیم. سابلو باید توی ۱۰ ثانیه جواب یک سؤال رو بده: «الان دستم چقدر باز است؟»"
  },
  {
    Icon: ShieldCheck,
    title: "اطلاعات مالی، فقط مال خودتونه",
    desc: "هیچ‌کس جز شما به تراکنش‌هاتون دسترسی نداره. داده‌های شما نه فروخته می‌شه، نه برای چیز دیگه‌ای استفاده می‌شه."
  },
  {
    Icon: HeartHandshake,
    title: "ساخته‌شده از دلِ یک دغدغه واقعی",
    desc: "سابلو از سرِ یک نیاز واقعی متولد شد، نه یک ایده روی کاغذ. هر ویژگی‌اش جواب یک مشکل واقعی توی زندگی روزمره‌ست."
  }
];

export default function AboutPage() {
  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
      `}</style>

      {/* هیرو */}
      <section className="relative overflow-hidden">
        {/* بافت تزئینی ملایم پس‌زمینه */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#0F6F5C]/5 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-16 w-64 h-64 rounded-full bg-amber-400/5 blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#0F6F5C]/10 text-[#0F6F5C] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            <Sparkles size={13} /> درباره سابلو
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#26241F] leading-[1.4] sm:leading-[1.3] mb-5">
            یه دفترچه حساب ساده،<br className="hidden sm:block" /> که همیشه همراهتونه
          </h1>

          <p className="text-sm sm:text-base text-[#5C5747] leading-8 max-w-xl mx-auto">
            سابلو رو ساختیم چون خسته شده بودیم از یادداشت پراکنده روی موبایل، فراموش کردن سررسید قسط‌ها،
            و ندونستن اینکه آخر ماه واقعاً چقدر پول دستمونه. یه جای واحد برای دیدن کل تصویر مالی‌مون،
            بدون پیچیدگی‌های اضافه.
          </p>
        </div>
      </section>

      {/* داستان */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 pb-16 sm:pb-20">
        <div className="bg-white border border-[#EDE8DC] rounded-3xl p-6 sm:p-10 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-[#26241F] mb-4">چرا اصلاً سابلو رو ساختیم؟</h2>
          <div className="space-y-4 text-sm sm:text-[15px] text-[#5C5747] leading-8">
            <p>
              همه‌چیز از یک دفترچه یادداشت شروع شد؛ جایی که مخارج روزمره، قسط‌های وام و حقوق ماهانه رو
              دستی می‌نوشتیم تا آخر ماه گم نشیم. اما دفترچه گم می‌شد، اپلیکیشن‌های حسابداری دیگه یا خیلی
              پیچیده بودن یا اصلاً به درد اقساط و وام نمی‌خوردن.
            </p>
            <p>
              برای همین تصمیم گرفتیم چیزی بسازیم که خودمون هر روز ازش استفاده کنیم؛ یه ابزار که بدون هیچ
              فرم پیچیده‌ای، دقیقاً بگه چقدر درآمد داشتیم، چقدر خرج کردیم، چه قسطی سررسیدش نزدیکه و چقدر
              بدهی روی دوشمونه. همین‌قدر ساده.
            </p>
            <p>
              سابلو هنوز هم داره رشد می‌کنه، دقیقاً به همون شکلی که نیازهای واقعی کاربرهاش شکلش می‌دن.
              اگه پیشنهادی دارید یا چیزی هست که دوست دارید ببینید، خوشحال می‌شیم بشنویم.
            </p>
          </div>
        </div>
      </section>

      {/* چیزهایی که سابلو دنبالشون می‌کنه */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 pb-16 sm:pb-20">
        <h2 className="text-lg sm:text-xl font-bold text-[#26241F] mb-6 text-center">
          همه‌ی گردش مالی‌تون، در یک نگاه
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRACK_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3.5 bg-white border border-[#EDE8DC] rounded-2xl p-4 sm:p-5"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.Icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#26241F] mb-1">{item.label}</h3>
                <p className="text-xs text-[#8A8273] leading-6">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ارزش‌ها */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 pb-16 sm:pb-20">
        <h2 className="text-lg sm:text-xl font-bold text-[#26241F] mb-6 text-center">
          چیزهایی که برامون مهمه
        </h2>
        <div className="space-y-3">
          {VALUES.map((v) => (
            <div key={v.title} className="flex items-start gap-4 bg-white border border-[#EDE8DC] rounded-2xl p-5">
              <div className="w-11 h-11 rounded-xl bg-[#0F6F5C]/10 text-[#0F6F5C] flex items-center justify-center shrink-0">
                <v.Icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#26241F] mb-1.5">{v.title}</h3>
                <p className="text-xs sm:text-[13px] text-[#8A8273] leading-6">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* دعوت به اقدام */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 pb-20 sm:pb-28">
        <div className="relative overflow-hidden bg-[#0F6F5C] rounded-3xl p-8 sm:p-12 text-center">
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5" />

          <h2 className="relative text-xl sm:text-2xl font-extrabold text-white mb-3">
            آماده‌اید یه نگاه واقعی به وضعیت مالی‌تون بندازید؟
          </h2>
          <p className="relative text-emerald-50/80 text-sm mb-7 max-w-md mx-auto leading-7">
            ثبت اولین تراکنشتون کمتر از یک دقیقه طول می‌کشه.
          </p>
          <Link
            href="/dashboard"
            className="relative inline-flex items-center gap-2 bg-white text-[#0F6F5C] text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            برو به داشبورد
            <ArrowLeft size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
