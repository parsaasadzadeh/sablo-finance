const testimonials = [
  {
    initial: "س",
    name: "سامان راد",
    role: "برنامه‌نویس",
    text: "من همیشه سر قسط‌ها و وامی که داشتم گیج می‌شدم. برنامه‌های دیگه فکر می‌کردن وام درآمدِ منه و آخر ماه موجودیم منفی می‌شد. سابلو واقعاً به دادم رسید و فهمیدم چقدر بدهی دارم.",
    avatar: "bg-emerald-100 text-emerald-700",
  },
  {
    initial: "ن",
    name: "نازنین مهدوی",
    role: "طراح UI/UX",
    text: "قبلاً پول‌هام یهویی غیب می‌شدن! الان دلیل هر پولی رو ثبت می‌کنم و داشبورد سابلو مثل یه مشاور مالی بالای سرِ منه. به همه پیشنهاد می‌کنم برای یک بار هم که شده ازش استفاده کنن.",
    avatar: "bg-amber-100 text-amber-700",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="mb-20">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-3 text-[#1A1916] leading-9">
          نظر کاربرانی که زندگی مالی‌شان را نجات دادند
        </h2>
        <p className="text-xs text-[#8A8273]">
          آنچه مشتریان ما در مورد سابلو می‌گویند:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="relative bg-[#FCFBF8] p-7 rounded-3xl border border-[#EDE8DC]/80 shadow-[0_10px_30px_-15px_rgba(26,25,22,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-14px_rgba(26,25,22,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {/* علامت نقل‌قول ملایم */}
            <span
              aria-hidden="true"
              className="absolute top-3 left-6 text-6xl leading-none text-[#0F6F5C]/10 select-none"
            >
              ”
            </span>

            <div
              className="flex items-center gap-0.5 text-amber-400 mb-4 text-xs"
              aria-label="امتیاز ۵ از ۵"
            >
              <span aria-hidden="true">⭐⭐⭐⭐⭐</span>
            </div>

            <blockquote className="text-xs text-[#26241F] leading-7 mb-5">
              «{t.text}»
            </blockquote>

            <figcaption className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full ${t.avatar} flex items-center justify-center text-xs font-bold ring-4 ring-white`}
              >
                {t.initial}
              </div>
              <div>
                <h5 className="text-[11px] font-bold text-[#1A1916]">{t.name}</h5>
                <span className="text-[10px] text-[#8A8273]">{t.role}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
