"use client";
import { useState } from "react";
import { User, Loader2 } from "lucide-react";
import api from "@/lib/axios"; // فراخوانی اینس‌تنس اکسیوس شخصی‌سازی شده شما

export default function CompleteProfileForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const response = await api.put(
        "/auth/complete-profile", 
        { name: name.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        onSuccess();
      }
    } catch (err) {
      console.error("Complete profile error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "خطایی در ثبت اطلاعات رخ داد. مجدداً تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-[fadeIn_.25s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#0F6F5C]/10 text-[#0F6F5C]">
          <User size={18} />
        </span>
        <span className="text-xs font-medium text-[#9A8F78] tracking-wide">
          تکمیل اطلاعات حساب کاربری
        </span>
      </div>

      <h1 className="text-xl font-bold text-[#26241F] mb-1.5">پروفایل خود را بسازید ✏️</h1>
      <p className="text-sm text-[#8A8273] mb-6 leading-6">
        لطفاً نام یا نام مستعاری که دوست دارید با آن در اپلیکیشن شناخته شوید را وارد کنید.
      </p>

      <label className="block text-sm font-medium text-[#3A372F] mb-2">
        نام و نام خانوادگی
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 transition-colors ${
          error
            ? "border-[#D9624C] bg-[#FCF1EE]"
            : "border-[#E5E1D6] bg-[#FCFBF8] focus-within:border-[#0F6F5C]"
        }`}
      >
        <User size={18} className="text-[#9A8F78] shrink-0" />
        <input
          type="text"
          placeholder="مثلاً: پارسا اسدزاده"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          className="w-full bg-transparent outline-none text-[#26241F] placeholder:text-[#C7C0AE] text-base"
          autoFocus
        />
      </div>
      {error && <p className="text-xs text-[#D9624C] mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-[#0F6F5C] hover:bg-[#0C5A4A] disabled:opacity-70 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "در حال ثبت اطلاعات..." : "تایید و ورود به برنامه"}
      </button>
    </form>
  );
}