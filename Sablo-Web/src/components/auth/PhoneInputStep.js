"use client";
import { useState } from "react";
import { Smartphone, Loader2 } from "lucide-react";
import api from "@/lib/axios"; // مسیر فایل lib خودت رو چک کن
import { sanitizeDigits } from "@/utils/formatters"; // مسیر فایل utils رو چک کن
import { isValidIranianMobile } from "@/utils/validators";

export default function PhoneInputStep({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = sanitizeDigits(phone).trim();

    if (!isValidIranianMobile(cleanPhone)) {
      setError("شماره موبایل را به‌صورت صحیح وارد کنید، مثلاً ۰۹۱۲۱۲۳۴۵۶۷");
      return;
    }

    setError("");
    setSending(true);

    try {
      await api.post("/auth/request-otp", { phone: cleanPhone });
      onSuccess(cleanPhone); // پاس دادن شماره به والد و رفتن به مرحله بعد
    } catch (err) {
      setError(err.response?.data?.message || "خطا در ارسال کد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 animate-[fadeIn_.25s_ease]">
      <h1 className="text-xl font-bold text-[#26241F] mb-1.5">خوش آمدید 👋</h1>
      <p className="text-sm text-[#8A8273] mb-6 leading-6">شماره موبایل خود را وارد کنید.</p>

      <label className="block text-sm font-medium text-[#3A372F] mb-2">شماره موبایل</label>
      <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 transition-colors ${error ? "border-[#D9624C] bg-[#FCF1EE]" : "border-[#E5E1D6] bg-[#FCFBF8] focus-within:border-[#0F6F5C]"}`}>
        <Smartphone size={18} className="text-[#9A8F78] shrink-0" />
        <input
          type="tel"
          dir="ltr"
          inputMode="numeric"
          maxLength={11}
          placeholder="0912 123 4567"
          value={phone}
          onChange={(e) => {
            setPhone(sanitizeDigits(e.target.value).slice(0, 11));
            setError("");
          }}
          className="w-full bg-transparent outline-none text-[#26241F] placeholder:text-[#C7C0AE] tracking-wider text-base"
          autoFocus
        />
      </div>
      {error && <p className="text-xs text-[#D9624C] mt-2">{error}</p>}

      <button type="submit" disabled={sending} className="w-full mt-6 bg-[#0F6F5C] hover:bg-[#0C5A4A] disabled:opacity-70 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors">
        {sending && <Loader2 size={16} className="animate-spin" />}
        {sending ? "در حال ارسال کد..." : "ارسال کد تایید"}
      </button>
    </form>
  );
}