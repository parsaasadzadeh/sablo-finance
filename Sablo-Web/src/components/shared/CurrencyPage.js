"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CurrencyProvider } from "@/context/currencyContext";
import api from "@/lib/axios";

/**
 * واحد پول کاربر را از /auth/me می‌گیرد و children را داخل CurrencyProvider رندر می‌کند.
 * اگر کاربر وارد نشده باشد به صفحه‌ی اصلی می‌رود (همان رفتار صفحه‌ی وام‌ها).
 */
export default function CurrencyPage({ children }) {
  const router = useRouter();
  const [currency, setCurrency] = useState("IRT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setCurrency(res.data.user.currency ?? "IRT"))
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

  return <CurrencyProvider initialCurrency={currency}>{children}</CurrencyProvider>;
}
