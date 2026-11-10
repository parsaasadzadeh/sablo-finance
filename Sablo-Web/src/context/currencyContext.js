"use client";
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "@/lib/axios";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children, initialCurrency = "IRT" }) {
  const [currency, setCurrency] = useState(initialCurrency);

  const display = useCallback(
    (amount) =>
      currency === "IRT"
        ? (amount / 10).toLocaleString("fa-IR")
        : amount.toLocaleString("fa-IR"),
    [currency]
  );

  const unit = useMemo(() => (currency === "IRT" ? "تومان" : "ریال"), [currency]);

  const changeCurrency = useCallback(async (val) => {
    setCurrency(val);
    try {
      await api.patch("/auth/currency", { currency: val });
    } catch {
      // بی‌صدا رد میکنیم
    }
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, display, unit, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
