"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/axios";

const CardContext = createContext({
  cards: [],
  setCards: () => {},
  activeCard: null,
  setActiveCard: () => {},
  cardsLoading: true,
  refetchCards: async () => {},
});

const readToken = () => {
  try { return localStorage.getItem("token"); } catch { return null; }
};

export function CardProvider({ children }) {
  const pathname = usePathname();

  const [cards,        setCards]        = useState([]);
  const [activeCard,   setActiveCard]   = useState(null);
  const [cardsLoading, setCardsLoading] = useState(true);

  // توکنی که کارت‌های فعلی برای آن لود شده‌اند. این رفرنس باعث می‌شود
  // بعد از لاگین (بدون رفرش صفحه) یا عوض شدن حساب، کارت‌ها دوباره لود شوند.
  const loadedTokenRef = useRef(null);
  const initializedRef = useRef(false);
  const requestRef     = useRef(0);

  const refetchCards = useCallback(async () => {
    const token = readToken();
    const reqId = ++requestRef.current;

    if (!token) {
      loadedTokenRef.current = null;
      setCards([]);
      setActiveCard(null);
      setCardsLoading(false);
      return;
    }

    setCardsLoading(true);
    try {
      const res  = await api.get("/cards");
      if (reqId !== requestRef.current) return; // پاسخ کهنه
      const raw  = res.data?.cards ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      loadedTokenRef.current = token;
      setCards(list);
      // اگر کارتِ فعال دیگر وجود ندارد (مثلاً از دستگاه دیگر حذف شده) فیلتر را بردار
      setActiveCard((prev) => (prev ? list.find((c) => c._id === prev._id) ?? null : null));
    } catch {
      // loadedTokenRef عمداً تنظیم نمی‌شود تا در ناوبری بعدی دوباره تلاش شود
    } finally {
      if (reqId === requestRef.current) setCardsLoading(false);
    }
  }, []);

  const syncWithToken = useCallback(() => {
    const token = readToken();
    if (initializedRef.current && token === loadedTokenRef.current) return;
    initializedRef.current = true;

    // حساب کاربری عوض شده: کارت‌های حساب قبلی نباید حتی یک لحظه نمایش داده شوند
    if (loadedTokenRef.current && token !== loadedTokenRef.current) {
      setCards([]);
      setActiveCard(null);
    }
    refetchCards();
  }, [refetchCards]);

  // هر بار که صفحه عوض می‌شود (مثلاً بعد از لاگین → داشبورد) وضعیت توکن را چک کن
  useEffect(() => { syncWithToken(); }, [pathname, syncWithToken]);

  // لاگین/لاگ‌اوت در تب دیگر
  useEffect(() => {
    const onStorage = (e) => { if (e.key === "token" || e.key === null) syncWithToken(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncWithToken]);

  return (
    <CardContext.Provider value={{
      cards, setCards,
      activeCard, setActiveCard,
      cardsLoading, refetchCards,
    }}>
      {children}
    </CardContext.Provider>
  );
}

export const useCard = () => useContext(CardContext);

