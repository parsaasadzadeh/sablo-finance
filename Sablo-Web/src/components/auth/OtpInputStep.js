"use client";
import { useState, useEffect, useRef } from "react";
import { Pencil, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { sanitizeDigits } from "@/utils/formatters";

const OTP_LENGTH = 5;
const RESEND_SECONDS = 60;

export default function OtpInputStep({ phone, onEditPhone, onSuccess }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  // تایمر
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // فوکوس اولیه روی اینپوت اول
  useEffect(() => {
    setTimeout(() => inputsRef.current[0]?.focus(), 50);
  }, []);

  const formattedTimer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const handleDigitChange = (index, raw) => {
    const value = sanitizeDigits(raw).slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = sanitizeDigits(e.clipboardData.getData("text")).slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => (next[i] = ch));
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    try {
      await api.post("/auth/request-otp", { phone });
      setSeconds(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      setError("");
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "خطا در ارسال مجدد کد.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError("کد تایید را کامل وارد کنید");
      return;
    }
    
    setVerifying(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", { phone, code });
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        onSuccess(response.data.needsProfileCompletion);
      }
    } catch (err) {
      setError(err.response?.data?.message || "کد وارد شده صحیح نیست.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 animate-[fadeIn_.25s_ease]">
      <h1 className="text-xl font-bold text-[#26241F] mb-1.5">کد تایید را وارد کنید</h1>
      <div className="flex items-center gap-1.5 text-sm text-[#8A8273] mb-6">
        <span>کد به شماره</span>
        <span dir="ltr" className="font-semibold text-[#26241F] tracking-wide">{phone}</span>
        <span>ارسال شد</span>
        <button type="button" onClick={onEditPhone} className="inline-flex items-center text-[#0F6F5C] hover:text-[#0C5A4A] mr-1">
          <Pencil size={14} />
        </button>
      </div>

      <div dir="ltr" className="flex justify-center gap-2.5 mb-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={d}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleDigitKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl border outline-none transition-colors bg-[#FCFBF8] ${error ? "border-[#D9624C] bg-[#FCF1EE]" : d ? "border-[#0F6F5C] text-[#0F6F5C]" : "border-[#E5E1D6] focus:border-[#0F6F5C]"}`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-[#D9624C] text-center mt-2">{error}</p>}

      <div className="flex items-center justify-center gap-1.5 text-xs text-[#9A8F78] mt-5 tabular">
        {seconds > 0 ? (
          <span>ارسال دوباره کد تا <span className="text-[#26241F] font-medium">{formattedTimer}</span></span>
        ) : (
          <button type="button" onClick={handleResend} className="text-[#0F6F5C] font-medium hover:text-[#0C5A4A]">ارسال دوباره کد</button>
        )}
      </div>

      <button type="submit" disabled={verifying} className="w-full mt-6 bg-[#0F6F5C] hover:bg-[#0C5A4A] disabled:opacity-70 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors">
        {verifying && <Loader2 size={16} className="animate-spin" />}
        {verifying ? "در حال بررسی..." : "تایید و ورود"}
      </button>
    </form>
  );
}