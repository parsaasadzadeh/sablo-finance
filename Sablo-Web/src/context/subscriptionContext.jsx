"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/axios";
import { onSessionCleared } from "@/lib/subscriptionBus";

const defaultStatus = {
  hasAccess: true, // تا وقتی وضعیت واقعی نیامده دسترسی می‌دهیم (سرور enforce می‌کند)
  status: null,
  plan: null,
  endDate: null,
  daysLeft: null,
  platform: null,
};

const SubscriptionContext = createContext({
  subscription: defaultStatus,
  loaded: false,
  refetch: async () => {},
  reset: () => {},
});

const getToken = () => {
  try { return localStorage.getItem("token"); } catch { return null; }
};

export function SubscriptionProvider({ children }) {
  const pathname = usePathname();
  const [subscription, setSubscription] = useState(defaultStatus);
  const [loaded, setLoaded] = useState(false);
  const reqIdRef = useRef(0);       // پاسخ‌های قدیمی (کاربر قبلی) نادیده گرفته شوند
  const tokenRef = useRef(null);    // توکنی که وضعیت فعلی برای آن است

  const reset = useCallback(() => {
    reqIdRef.current += 1;
    tokenRef.current = null;
    setSubscription(defaultStatus);
    setLoaded(false);
  }, []);

  const refetch = useCallback(async () => {
    const token = getToken();
    const reqId = ++reqIdRef.current;
    if (!token) {
      tokenRef.current = null;
      setSubscription(defaultStatus);
      setLoaded(false);
      return;
    }
    tokenRef.current = token;
    try {
      const res = await api.get("/subscription/status");
      if (reqId !== reqIdRef.current) return;
      setSubscription(res.data);
      setLoaded(true);
    } catch {
      // خطای شبکه: وضعیت قبلی می‌ماند و دسترسی قطع نمی‌شود
    }
  }, []);

  // با هر تغییر مسیر: اگر کاربر (توکن) عوض شده یا هنوز وضعیت نداریم، دوباره بگیر.
  // این‌طور بعد از ورود (که توکن تازه ذخیره می‌شود) بدون رفرش، وضعیت درست بارگذاری می‌شود.
  useEffect(() => {
    const token = getToken();
    if (token !== tokenRef.current) {
      if (tokenRef.current) reset();
      if (token) refetch();
    }
  }, [pathname, refetch, reset]);

  // برگشت به تب (مثلاً بعد از پرداخت یا انقضا) وضعیت به‌روز شود
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && getToken()) refetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetch]);

  useEffect(() => onSessionCleared(reset), [reset]);

  const value = useMemo(() => ({ subscription, loaded, refetch, reset }), [subscription, loaded, refetch, reset]);
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export const useSubscription = () => useContext(SubscriptionContext);
