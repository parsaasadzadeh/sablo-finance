"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  User,
  Bell,
  LogOut,
  X,
  CheckCircle2,
  Smartphone,
  Hash,
  Wifi,
  AlertTriangle,
  Sun,
  Moon,
  Crown,
  PiggyBank,
  Tag,
  Banknote,
  Users,
  BookOpen,
} from "lucide-react";
import api from "@/lib/axios";
import { useTheme } from "@/context/themeContext";
import { useSubscription } from "@/context/subscriptionContext";
import { emitSessionCleared } from "@/lib/subscriptionBus";
import TutorialModal from "@/components/tutorial/TutorialModal";

// ⚠️ آدرس ربات تلگرام را با نام واقعی ربات خودتان عوض کنید
const TELEGRAM_BOT_URL = "https://t.me/SabloFinanceBot";

/* هر گام: رنگ آیکن و پس‌زمینه از توکن‌های تم */
const STEPS = [
  { icon: Smartphone, fg: "--info", bg: "--info-light", title: "ورود به تلگرام",
    desc: "اپلیکیشن تلگرام را باز کنید. اگر حساب ندارید ابتدا ثبت‌نام کنید.", warning: null },
  { icon: Hash, fg: "--telegram", bg: "--telegram-light", title: "جستجوی ربات",
    desc: "در قسمت جستجو، نام «SabloFinanceBot» را تایپ کنید یا روی دکمه «رفتن به ربات» بزنید.", warning: null },
  { icon: CheckCircle2, fg: "--brand", bg: "--brand-light", title: "ارسال استارت",
    desc: "وارد ربات شوید و دکمه «شروع / Start» را لمس کنید تا ربات فعال شود.", warning: null },
  { icon: Hash, fg: "--warning", bg: "--warning-light", title: "وارد کردن شماره موبایل",
    desc: "شماره موبایلی که با آن در سابلو ثبت‌نام کرده‌اید را دقیقاً وارد کنید تا ربات حسابتان را شناسایی کند.",
    warning: "شماره موبایل باید دقیقاً همان شماره‌ای باشد که در سابلو ثبت کرده‌اید." },
  { icon: Wifi, fg: "--danger", bg: "--danger-light", title: "قطع نکردن ربات",
    desc: "پس از راه‌اندازی، ربات را بلاک یا حذف نکنید. در غیر این صورت اعلان‌ها ارسال نخواهند شد.",
    warning: "گزینه «Stop and block bot» را نزنید — اعلان‌های سررسید قطع می‌شوند." },
];

const toPersianNum = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const v = (name) => `var(${name})`;

const PLAN_NAMES = { trial: "دوره رایگان", monthly: "ماهانه", biannual: "۶ ماهه", annual: "سالانه" };

/* ───────── مودال راهنما ───────── */
function TelegramGuideModal({ open, onClose, onGoToBot }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--overlay)]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full sm:max-w-lg h-[88vh] sm:h-auto sm:max-h-[85vh] bg-[var(--card)] rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[color:var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[color:var(--ink)]">راهنمای فعال‌سازی اعلان</h2>
            <p className="text-xs text-[color:var(--muted)] mt-0.5">ربات یادآوری اقساط تلگرام</p>
          </div>
          <button onClick={onClose} aria-label="بستن" className="p-1.5 rounded-full hover:bg-[var(--hover)]">
            <X size={22} className="text-[color:var(--muted)]" />
          </button>
        </div>

        <div className="flex items-center gap-2 mx-4 mt-3.5 mb-1 px-3 py-2.5 rounded-xl bg-[var(--warning-light)] border border-[color:var(--warning-border)]">
          <AlertTriangle size={16} className="text-[color:var(--warning)] shrink-0" />
          <p className="text-xs font-semibold text-[color:var(--warning)] leading-5">
            برای استفاده از این قابلیت حتماً باید حساب تلگرام داشته باشید.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center w-9 shrink-0">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{ background: v(step.bg), color: v(step.fg) }}
                  >
                    <Icon size={18} />
                  </div>
                  {idx < STEPS.length - 1 && <div className="flex-1 w-0.5 bg-[var(--border)] my-1 min-h-5" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[color:var(--brand)] bg-[var(--brand-light)] rounded-md px-1.5 py-0.5">
                      گام {toPersianNum(idx + 1)}
                    </span>
                    <span className="text-sm font-bold text-[color:var(--ink)]">{step.title}</span>
                  </div>
                  <p className="text-[13px] text-[color:var(--muted)] leading-[21px]">{step.desc}</p>
                  {step.warning && (
                    <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--danger-light)] border border-[color:var(--danger-border)]">
                      <p className="text-[11px] font-semibold text-[color:var(--danger)] leading-[18px]">{step.warning}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pt-3 pb-5 border-t border-[color:var(--border)]">
          <button
            onClick={onGoToBot}
            className="w-full py-3.5 rounded-2xl bg-[var(--telegram)] hover:opacity-90 text-white text-[15px] font-bold transition-opacity"
          >
            رفتن به ربات تلگرام
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── اجزای کوچک ───────── */
function Row({ icon, iconBg, label, sub, onClick, children, danger }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 text-right bg-[var(--card)] rounded-[14px] px-4 py-3.5 mb-2.5 border border-[color:var(--border)] ${
        onClick ? "hover:bg-[var(--hover)] transition-colors" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: v(iconBg) }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-semibold ${danger ? "text-[color:var(--danger)]" : "text-[color:var(--ink)]"}`}>
            {label}
          </div>
          {sub}
        </div>
      </div>
      {children ?? (onClick && !danger ? <ChevronRight size={18} className="text-[color:var(--muted)] rotate-180" /> : null)}
    </Tag>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-colors ${
        active
          ? "bg-[var(--brand)] border-[color:var(--brand)] text-white"
          : "bg-[var(--bg)] border-[color:var(--border)] text-[color:var(--muted)]"
      }`}
    >
      {children}
    </button>
  );
}

/* ───────── محتوای اصلی ───────── */
function SettingsContent({ user }) {
  const router = useRouter();
  const { mode, setMode } = useTheme();
  const [guideOpen, setGuideOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const { subscription, loaded: subLoaded } = useSubscription();

  const handleLogout = () => {
    // خروج یعنی پاک کردن توکن؛ بک‌اند مسیر /auth/logout ندارد.
    // قبلاً توکن می‌ماند و AuthRedirect صفحه‌ی اصلی کاربر را دوباره به داشبورد می‌برد.
    try { localStorage.removeItem("token"); } catch {}
    emitSessionCleared(); // وضعیت اشتراک این کاربر برای کاربر بعدی نماند
    router.replace("/");
  };

  const openTelegramBot = () => {
    setGuideOpen(false);
    window.open(TELEGRAM_BOT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="flex items-center justify-between px-4 py-3.5 bg-[var(--card)] border-b border-[color:var(--border)]">
        <button onClick={() => router.back()} aria-label="بازگشت" className="p-1 w-8">
          <ChevronRight size={24} className="text-[color:var(--ink)]" />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold text-[color:var(--ink)]">تنظیمات</h1>
        <div className="w-8" />
      </header>

      <main className="max-w-xl mx-auto p-4 pb-10">
        <section className="flex items-center gap-3 bg-[var(--card)] rounded-2xl p-4 mb-4 border border-[color:var(--border)]">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-light)] flex items-center justify-center">
            <User size={22} className="text-[color:var(--brand)]" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-[color:var(--ink)]">{user?.name || "کاربر"}</div>
            {user?.phone && (
              <div dir="ltr" className="text-xs text-[color:var(--muted)] mt-0.5 text-right">
                {user.phone}
              </div>
            )}
          </div>
        </section>

        <Row
          onClick={() => router.push("/subscription")}
          label="اشتراک"
          iconBg="--warning-light"
          icon={<Crown size={18} className="text-[color:var(--warning)]" />}
          sub={
            <div className="text-[11px] text-[color:var(--muted)] mt-0.5">
              {!subLoaded
                ? "در حال بررسی…"
                : !subscription.hasAccess
                ? "اشتراک شما به پایان رسیده"
                : subscription.daysLeft === null
                ? "فعال"
                : `${PLAN_NAMES[subscription.plan] ?? "فعال"} — ${toPersianNum(subscription.daysLeft)} روز مانده`}
            </div>
          }
        />

        <Row
          onClick={() => router.push("/budgets")}
          label="بودجه‌بندی"
          iconBg="--warning-light"
          icon={<PiggyBank size={18} className="text-[color:var(--warning)]" />}
        />

        <Row
          onClick={() => router.push("/categories")}
          label="مدیریت دسته‌بندی‌ها"
          iconBg="--info-light"
          icon={<Tag size={18} className="text-[color:var(--info)]" />}
        />

        <Row
          onClick={() => router.push("/income-sources")}
          label="مدیریت منابع درآمد"
          iconBg="--brand-light"
          icon={<Banknote size={18} className="text-[color:var(--brand)]" />}
        />

        <Row
          onClick={() => router.push("/obligations")}
          label="طلب و بدهی"
          iconBg="--brand-light"
          icon={<Users size={18} className="text-[color:var(--brand)]" />}
        />

        <Row
          label="ظاهر برنامه"
          iconBg="--warning-light"
          icon={
            mode === "dark" ? (
              <Moon size={18} className="text-[color:var(--warning)]" />
            ) : (
              <Sun size={18} className="text-[color:var(--warning)]" />
            )
          }
        >
          <div className="flex gap-1.5">
            <Chip active={mode === "light"} onClick={() => setMode("light")}>
              <Sun size={13} /> روشن
            </Chip>
            <Chip active={mode === "dark"} onClick={() => setMode("dark")}>
              <Moon size={13} /> تاریک
            </Chip>
          </div>
        </Row>

        <Row
          onClick={() => setTutorialOpen(true)}
          label="آموزش استفاده از اپ"
          iconBg="--brand-light"
          icon={<BookOpen size={18} className="text-[color:var(--brand)]" />}
          sub={<div className="text-[11px] text-[color:var(--muted)] mt-0.5">راهنمای مرحله‌به‌مرحله‌ی همه‌ی بخش‌ها</div>}
        />

        <Row
          onClick={() => setGuideOpen(true)}
          label="یادآوری سررسید اقساط"
          iconBg="--info-light"
          icon={<Bell size={18} className="text-[color:var(--info)]" />}
          sub={
            <>
              <div className="text-[11px] text-[color:var(--muted)] mt-0.5">فعال‌سازی در ربات تلگرام</div>
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle size={11} className="text-[color:var(--warning)]" />
                <span className="text-[10px] font-semibold text-[color:var(--warning)]">نیاز به حساب تلگرام دارد</span>
              </div>
            </>
          }
        />

        <div className="mt-2">
          <Row
            onClick={handleLogout}
            danger
            label="خروج از حساب"
            iconBg="--danger-light"
            icon={<LogOut size={18} className="text-[color:var(--danger)]" />}
          />
        </div>
      </main>

      <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <TelegramGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} onGoToBot={openTelegramBot} />
    </div>
  );
}

/* ───────── صفحه ───────── */
export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[color:var(--brand)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return <SettingsContent user={user} />;
}