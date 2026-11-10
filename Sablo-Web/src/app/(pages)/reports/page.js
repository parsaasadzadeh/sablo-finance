"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CurrencyProvider } from "@/context/currencyContext";
import api from "@/lib/axios";
import ReportsContent from "@/components/reports/ReportsContent";

export default function ReportsPage() {
  const router = useRouter();
  const [initialCurrency, setInitialCurrency] = useState("IRT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setInitialCurrency(res.data.user.currency ?? "IRT"))
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

  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      <ReportsContent />
    </CurrencyProvider>
  );
}
