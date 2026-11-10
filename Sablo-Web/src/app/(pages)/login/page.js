"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, Smartphone } from "lucide-react";

// ایمپورت کامپوننت‌هایی که الان می‌سازیم
import PhoneInputStep from "@/components/auth/PhoneInputStep";
import OtpInputStep from "@/components/auth/OtpInputStep";
import SuccessStep from "@/components/auth/SuccessStep";
import AuthRedirect from "@/components/AuthRedirect";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState("phone"); // "phone" | "otp" | "done"
  const [phone, setPhone] = useState("");

  // هندل کردن زمانی که لاگین با موفقیت انجام شد
  const handleLoginSuccess = (needsProfileCompletion) => {
    if (needsProfileCompletion) {
      router.push("/complete-profile");
    } else {
      setStep("done");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  return (
    <div dir="rtl" lang="fa" className="min-h-screen w-full bg-[#F7F4EE] flex items-center justify-center p-6 font-sans">
       <AuthRedirect />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        .tabular { font-feature-settings: "tnum"; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-sm">
        {/* نوار پیشرفت */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="h-1.5 flex-1 rounded-full transition-colors duration-500 bg-[#0F6F5C]" />
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step === "phone" ? "bg-[#E4DFD2]" : "bg-[#0F6F5C]"}`} />
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8DC] p-7 overflow-hidden">
          {/* هدر باکس */}
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#0F6F5C]/10 text-[#0F6F5C]">
              {step === "done" ? <ShieldCheck size={18} /> : step === "otp" ? <KeyRound size={18} /> : <Smartphone size={18} />}
            </span>
            <span className="text-xs font-medium text-[#9A8F78] tracking-wide">
              {step === "done" ? "ورود موفق" : "ورود یا ثبت‌نام"}
            </span>
          </div>

          {/* رندر شرطی مراحل */}
          {step === "phone" && (
            <PhoneInputStep 
              onSuccess={(enteredPhone) => {
                setPhone(enteredPhone);
                setStep("otp");
              }} 
            />
          )}

          {step === "otp" && (
            <OtpInputStep 
              phone={phone}
              onEditPhone={() => setStep("phone")}
              onSuccess={handleLoginSuccess}
            />
          )}

          {step === "done" && <SuccessStep />}
        </div>
      </div>
    </div>
  );
}
