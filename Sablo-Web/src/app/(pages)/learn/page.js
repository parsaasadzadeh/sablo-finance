"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Monitor,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  CheckCircle2,
  Globe,
} from "lucide-react";

const iosSteps = [
  {
    icon: <Globe size={20} />,
    title: "سافاری را باز کنید",
    desc: "مرورگر Safari را در آیفون خود باز کنید. نصب فقط از طریق Safari ممکن است.",
  },
  {
    icon: <Globe size={20} />,
    title: "به سایت سابلو بروید",
    desc: "در نوار آدرس Safari آدرس sabloo.ir را تایپ کرده و وارد سایت شوید.",
  },
  {
    icon: <Share size={20} />,
    title: "دکمه اشتراک‌گذاری را بزنید",
    desc: "در پایین Safari روی آیکون مربع با فلش رو به بالا (Share) ضربه بزنید.",
  },
  {
    icon: <PlusSquare size={20} />,
    title: "«Add to Home Screen» را انتخاب کنید",
    desc: "در منو به پایین اسکرول کنید و گزینه «Add to Home Screen» را لمس کنید.",
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: "Add را بزنید",
    desc: "نام را تأیید کنید و دکمه Add را در گوشه بالا راست بزنید.",
  },
  {
    icon: <span>🎉</span>,
    title: "سابلو نصب شد!",
    desc: "آیکون سابلو روی صفحه اصلی آیفون شما ظاهر می‌شود.",
  },
];

const windowsSteps = [
  {
    icon: <Globe size={20} />,
    title: "Edge یا Chrome را باز کنید",
    desc: "پیشنهاد ما Edge است چون یکپارچگی بهتری با ویندوز دارد.",
  },
  {
    icon: <Globe size={20} />,
    title: "به سایت سابلو بروید",
    desc: "در نوار آدرس مرورگر sabloo.ir را وارد کرده و Enter بزنید.",
  },
  {
    icon: <Download size={20} />,
    title: "آیکون نصب را پیدا کنید",
    desc: "در نوار آدرس سمت راست آیکون نصب ظاهر می‌شود. در Edge عبارت «App available» نشان داده می‌شود.",
  },
  {
    icon: <MoreVertical size={20} />,
    title: "روی آیکون نصب کلیک کنید",
    desc: "یا از منوی سه‌نقطه (⋯) گزینه Apps ← Install this site as an app را انتخاب کنید.",
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: "Install را بزنید",
    desc: "در پنجره بازشده روی «Install» کلیک کنید تا اپ به دسکتاپ و منوی Start اضافه شود.",
  },
  {
    icon: <span>🎉</span>,
    title: "سابلو آماده است!",
    desc: "سابلو مثل یک اپ مستقل در ویندوز نصب شد. از دسکتاپ یا منوی Start باز کنید.",
  },
];

function TabBtn({ active, onClick, icon, label, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-2xl transition-all ${
        active
          ? "bg-[#0F6F5C] text-white shadow-md"
          : "bg-[#F7F4EE] text-[#6B6860] hover:bg-[#EDE8DC]"
      }`}
    >
      <span className={`p-2 rounded-xl ${active ? "bg-white/20" : "bg-white"}`}>
        {icon}
      </span>
      <span className="text-right">
        <span className="block font-bold text-sm">{label}</span>
        <span
          className={`block text-[11px] ${
            active ? "text-white/70" : "text-[#9A9285]"
          }`}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}

export default function InstallGuidePage() {
  const [platform, setPlatform] = useState("ios");

  // خواندن پارامتر ?platform=windows فقط در مرورگر (بدون useSearchParams تا build خطا ندهد)
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("platform");
      if (p === "windows") setPlatform("windows");
    } catch {
      // نادیده گرفتن خطا؛ پیش‌فرض iOS می‌ماند
    }
  }, []);

  const isIos = platform === "ios";
  const steps = isIos ? iosSteps : windowsSteps;
  const accent = isIos ? "#1A1916" : "#1565D8";

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F5F0]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#EDE8DC] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-[#6B6860] hover:text-[#0F6F5C] transition-colors"
          >
            <ChevronLeft size={16} />
            بازگشت
          </Link>
          <span className="text-[#DDD9D0]">|</span>
          <span className="text-sm font-bold text-[#1A1916]">آموزش نصب سابلو</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F6F5C] shadow-lg mb-2">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1916]">
            آموزش نصب برای آیفون و ویندوز
          </h1>
          <p className="text-sm text-[#6B6860] max-w-md mx-auto leading-7">
            سابلو یک Progressive Web App است، یعنی بدون نیاز به اپ‌استور، مستقیم
            روی گوشی یا کامپیوتر نصب می‌شود.
          </p>
        </div>

        {/* Platform tabs */}
        <div>
          <p className="text-xs font-bold text-[#9A9285] mb-3 text-center">
            دستگاه خود را انتخاب کنید
          </p>
          <div className="flex gap-3">
            <TabBtn
              active={isIos}
              onClick={() => setPlatform("ios")}
              icon={
                <Smartphone
                  size={18}
                  className={isIos ? "text-[#0F6F5C]" : "text-[#6B6860]"}
                />
              }
              label="آیفون (iOS)"
              sub="Safari · iOS 16.4+"
            />
            <TabBtn
              active={!isIos}
              onClick={() => setPlatform("windows")}
              icon={
                <Monitor
                  size={18}
                  className={!isIos ? "text-[#1565D8]" : "text-[#6B6860]"}
                />
              }
              label="ویندوز"
              sub="Edge · Chrome"
            />
          </div>
        </div>

        {/* Note box */}
        {isIos ? (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <span className="text-xl shrink-0">⚠️</span>
            <p className="text-xs text-amber-800 leading-6">
              نصب در آیفون <span className="font-bold">فقط از طریق Safari</span>{" "}
              ممکن است. اگر از Chrome یا Firefox استفاده می‌کنید، ابتدا Safari را
              باز کنید.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
            <span className="text-xl shrink-0">💡</span>
            <p className="text-xs text-blue-800 leading-6">
              در ویندوز هر دو مرورگر <span className="font-bold">Edge</span> و{" "}
              <span className="font-bold">Chrome</span> پشتیبانی می‌کنند.
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#1A1916]">
            {isIos ? "مراحل نصب در آیفون" : "مراحل نصب در ویندوز"}
          </h2>

          {steps.map((step, i) => (
            <div
              key={`${platform}-${i}`}
              className="bg-white border border-[#EDE8DC] rounded-2xl px-5 py-4 flex gap-4 items-start"
            >
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px h-6 bg-[#EDE8DC]" />}
              </div>

              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm" style={{ color: accent }}>
                    {step.icon}
                  </span>
                  <p className="font-bold text-sm text-[#1A1916]">{step.title}</p>
                </div>
                <p className="text-xs text-[#6B6860] leading-6">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Android note */}
        <div className="bg-white border border-[#EDE8DC] rounded-2xl px-5 py-5 flex gap-4 items-start">
          <span className="text-2xl shrink-0">🤖</span>
          <div className="text-right">
            <p className="font-bold text-sm text-[#1A1916] mb-1">کاربران اندروید</p>
            <p className="text-xs text-[#6B6860] leading-6">
              کاربران اندروید می‌توانند سابلو را از{" "}
              <span className="font-bold text-[#2B9348]">بازار</span> یا{" "}
              <span className="font-bold text-[#1565D8]">مایکت</span> دانلود کنند.
              کافیست عبارت{" "}
              <span className="font-bold text-[#1A1916]">«سابلو»</span> را در این
              اپ‌استورها سرچ کنید.
            </p>
            <div className="flex gap-3 mt-3">
              <a
                href="https://cafebazaar.ir/app/com.sabloapp.sablo"
                className="flex items-center gap-1.5 bg-[#1A1916] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                🛒 بازار
              </a>
              <a
                href="https://myket.ir/app/com.sabloapp.sablo"
                className="flex items-center gap-1.5 bg-[#1565D8] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                🟦 مایکت
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#9A9285] pb-4">
          سابلو — مدیریت مالی ساده‌تر 🌿
        </p>
      </div>
    </main>
  );
}
