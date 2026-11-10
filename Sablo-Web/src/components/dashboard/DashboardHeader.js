"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, Settings, BookOpen } from "lucide-react";
import { formatJalaliDate } from "@/utils/date";
import TutorialModal from "@/components/tutorial/TutorialModal";

const LAST_SEEN_KEY = "notif_last_seen_count";

export default function DashboardHeader({
  notifications,
  unreadCount,
  onMarkAsRead,
  userName,
  userPhone,
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const [lastSeenCount, setLastSeenCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(LAST_SEEN_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (isNotifOpen) {
      setLastSeenCount(unreadCount);
      localStorage.setItem(LAST_SEEN_KEY, String(unreadCount));
    }
  }, [isNotifOpen, unreadCount]);

  const hasNewNotifications = unreadCount > lastSeenCount;
  const newCount = Math.max(0, unreadCount - lastSeenCount);
  const greetingName = userName?.trim() || userPhone || "";

  return (
    <header className="flex items-center justify-between mb-4 bg-[var(--card)] p-4 rounded-[20px] border border-[color:var(--border)] relative">
      <div>
        <h1 className="text-base font-bold text-[color:var(--ink)]">داشبورد مالی 💰</h1>
        <p className="text-[11px] text-[color:var(--muted)] mt-0.5">
          {greetingName ? `خوش آمدید، ${greetingName}` : "مدیریت درآمد، خرج، اقساط و وام‌ها"}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* آموزش */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          aria-label="آموزش استفاده از اپ"
          className="w-[38px] h-[38px] rounded-full bg-[var(--bg)] hover:bg-[var(--hover)] flex items-center justify-center transition-colors"
        >
          <BookOpen size={18} className="text-[color:var(--muted)]" />
        </button>

        {/* زنگ اعلان */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="اعلان‌ها"
            className="relative w-[38px] h-[38px] rounded-full bg-[var(--bg)] hover:bg-[var(--hover)] flex items-center justify-center transition-colors"
          >
            {hasNewNotifications ? (
              <BellRing size={20} className="text-[color:var(--amber-mid)]" />
            ) : (
              <Bell size={20} className="text-[color:var(--muted)]" />
            )}
            {hasNewNotifications && (
              <span className="absolute top-0 left-0 w-4 h-4 bg-[var(--rose-mid)] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-[1.5px] border-[color:var(--card)]">
                {newCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--card)] rounded-2xl shadow-xl border border-[color:var(--border)] z-50 overflow-hidden">
                <div className="p-3 border-b border-[color:var(--border)] bg-[var(--hover)] flex justify-between items-center">
                  <span className="text-xs font-bold text-[color:var(--ink)]">اعلانات و یادآوری‌ها</span>
                  <span className="text-[10px] bg-[var(--border)] text-[color:var(--muted)] px-2 py-0.5 rounded-full">
                    {unreadCount} جدید
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[color:var(--muted)]">پیامی ندارید</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-3 border-b border-[color:var(--border)] text-xs ${
                          notif.isRead ? "opacity-60" : "bg-[var(--warning-light)]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <strong className="text-[color:var(--ink)]">{notif.title}</strong>
                          {!notif.isRead && (
                            <button
                              onClick={() => onMarkAsRead(notif._id)}
                              aria-label="خوانده شد"
                              className="text-[color:var(--emerald-mid)] hover:bg-[var(--emerald-bg)] p-1 rounded"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-[color:var(--muted)] leading-relaxed text-[11px]">{notif.message}</p>
                        <span className="text-[9px] text-[color:var(--muted-light)] mt-2 block">
                          {formatJalaliDate(notif.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* تنظیمات (جایگزین دکمه خروج؛ خروج حالا داخل تنظیمات است) */}
        <Link
          href="/settings"
          aria-label="تنظیمات"
          className="w-[38px] h-[38px] rounded-full bg-[var(--bg)] hover:bg-[var(--hover)] flex items-center justify-center transition-colors"
        >
          <Settings size={18} className="text-[color:var(--muted)]" />
        </Link>
      </div>
      <TutorialModal open={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
    </header>
  );
}