"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompleteProfileForm from "@/components/auth/CompleteProfileForm";
import ProfileSuccessStep from "@/components/auth/ProfileSuccessStep";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isDone, setIsDone] = useState(false);

  // لایه حفاظتی امنیتی برای بررسی توکن قبل از بارگذاری فرم
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login"); // هدایت به صفحه ورود در صورت نبود توکن
    }
  }, [router]);

  const handleSuccess = () => {
    setIsDone(true);
    setTimeout(() => {
      router.push("/dashboard"); // هدایت به داشبورد پس از اتمام نمایش انیمیشن موفقیت
    }, 1500);
  };

  return (
    <div dir="rtl" lang="fa" className="min-h-screen w-full bg-[#F7F4EE] flex items-center justify-center p-6 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EDE8DC] p-7 overflow-hidden">
          {!isDone ? (
            <CompleteProfileForm onSuccess={handleSuccess} />
          ) : (
            <ProfileSuccessStep />
          )}
        </div>
      </div>
    </div>
  );
}