import { CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "تشخیص هوشمند وام از درآمد",
    text: "سابلو می‌داند که وام دریافتی در واقع «تعهد و بدهی» است، نه سود خالص! به شما می‌گوید چقدر از پول برای شماست و چقدر بدهی بانکی دارید.",
  },
  {
    title: "تحلیل‌گر روانشناسی مالی",
    text: "اگر دخل و خرجت به مشکل بخورد و تراز مالی‌اش منفی شود، سابلو سکوت نمی‌کند؛ بلکه با هشدارهای دلسوزانه به تو راهکار می‌دهد.",
  },
  {
    title: "سررسید اقساط و بدهی دوستان",
    text: "اگر از دوستی پول قرض کرده‌ای یا قسطی داری، با تعیین موعد بازپرداخت، سابلو سر موعد به تو یادآوری می‌کند که بدهی‌ات را صاف کنی.",
  },
  {
    title: "رابط کاربری کاملاً مینیمال و ساده",
    text: "بدون هیچ‌گونه پیچیدگی یا منوهای گیج‌کننده. همه چیز در یک نگاه تمیز، مرتب و به دور از سردرگمی است.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="bg-gradient-to-b from-white to-[#FCFBF8] rounded-[28px] border border-[#EDE8DC]/80 shadow-[0_10px_30px_-18px_rgba(26,25,22,0.15)] p-8 md:p-12 mb-20"
    >
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2
          id="features-title"
          className="text-2xl font-bold mb-3 text-[#1A1916] leading-9"
        >
          چرا به سابلو نیاز دارید؟
        </h2>
        <p className="text-xs text-[#8A8273] leading-6">
          امکانات هوشمندی که هیچ برنامه حسابداری سنتی‌ای ندارد.
        </p>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f) => (
          <li
            key={f.title}
            className="flex items-start gap-4 rounded-2xl p-5 transition-colors duration-300 hover:bg-emerald-50/50"
          >
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl ring-4 ring-emerald-50/70 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1.5 text-[#1A1916]">{f.title}</h3>
              <p className="text-xs text-[#8A8273] leading-7">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
