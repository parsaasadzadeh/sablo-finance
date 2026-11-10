"use client";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault() 
    setSent(true);
    setTimeout(() => setSent(false), 2500);
    setForm({ name: "", phone: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: "fa-solid fa-envelope",
      label: "ایمیل",
      value: "sablo.finance.ir@gmail.com",
    },
    {
      icon: "fa-brands fa-instagram",
      label: "اینستاگرام",
      value: "@sablo_finance.ir",
    },
    {
      icon: "fa-solid fa-clock",
      label: "ساعات پاسخ‌گویی",
      value: "4 شنبه از ساعت 9 تا 6",
    },
  ];

  return (
    <div
      dir="rtl"
      lang="fa"
      className="min-h-screen w-full bg-[#F7F4EE] flex items-center justify-center p-6 font-sans"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-4xl">
        {/* هدر صفحه */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F6F5C]/10 text-[#0F6F5C] mb-3">
            <i className="fa-solid fa-comment-dots text-xl"></i>
          </span>
          <h1 className="text-2xl font-bold text-[#2B2B28] mb-2">در تماس باشید</h1>
          <p className="text-sm text-[#9A8F78] max-w-md mx-auto leading-7">
            سوالی دارید یا می‌خواهید نظرتون رو با ما در میون بذارید؟ فرم زیر رو پر کنید تا در سریع‌ترین زمان ممکن پاسخگوی شما باشیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* کارت اطلاعات تماس */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8DC] p-7 flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-[#2B2B28] mb-1">راه‌های ارتباطی</h2>
              <p className="text-xs text-[#9A8F78] leading-6">
                از هر کدوم از روش‌های زیر می‌تونید با تیم ما در ارتباط باشید.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {contactInfo.map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#0F6F5C]/10 text-[#0F6F5C] shrink-0">
                    <i className={`${icon} text-sm`}></i>
                  </span>
                  <div>
                    <p className="text-[11px] font-medium text-[#9A8F78] mb-0.5">{label}</p>
                    <p className="text-sm text-[#2B2B28] font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-[#EDE8DC]">
              <p className="text-[11px] font-medium text-[#9A8F78] mb-3">ما رو دنبال کنید</p>
              <div className="flex gap-2">
                <a
                  href="https://www.instagram.com/sablo_finance.ir"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#F7F4EE] text-[#0F6F5C] hover:bg-[#0F6F5C] hover:text-white transition-colors duration-300"
                >
                  <i className="fa-brands fa-instagram text-sm"></i>
                </a>
              </div>
            </div>
          </div>

          {/* فرم تماس */}
          <div className="md:col-span-3 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8DC] p-7">
            <h2 className="text-sm font-semibold text-[#2B2B28] mb-5">ارسال پیام</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#9A8F78]">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="مثلاً علی محمدی"
                    className="w-full h-11 px-4 rounded-xl bg-[#F7F4EE] border border-transparent text-sm text-[#2B2B28] placeholder:text-[#B8B0A0] focus:outline-none focus:border-[#0F6F5C]/40 focus:bg-white transition-colors duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#9A8F78]">شماره موبایل</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full h-11 px-4 rounded-xl bg-[#F7F4EE] border border-transparent text-sm text-[#2B2B28] placeholder:text-[#B8B0A0] tabular-nums focus:outline-none focus:border-[#0F6F5C]/40 focus:bg-white transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#9A8F78]">موضوع</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="موضوع پیام شما"
                  className="w-full h-11 px-4 rounded-xl bg-[#F7F4EE] border border-transparent text-sm text-[#2B2B28] placeholder:text-[#B8B0A0] focus:outline-none focus:border-[#0F6F5C]/40 focus:bg-white transition-colors duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#9A8F78]">پیام شما</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="پیام خودتون رو اینجا بنویسید..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F4EE] border border-transparent text-sm text-[#2B2B28] placeholder:text-[#B8B0A0] resize-none focus:outline-none focus:border-[#0F6F5C]/40 focus:bg-white transition-colors duration-200"
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#0F6F5C] text-white text-sm font-semibold hover:bg-[#0C5A4A] active:scale-[0.98] transition-all duration-200"
              >
                {sent ? (
                  <>
                    <i className="fa-solid fa-circle-check text-sm"></i>
                    پیام شما ارسال شد
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane text-sm"></i>
                    ارسال پیام
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
