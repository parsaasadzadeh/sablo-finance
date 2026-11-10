"use client";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { useTheme } from "@/context/themeContext";

/** انتخابگر تاریخ شمسی هم‌سبک بقیه‌ی فرم‌ها. value/onChange با DateObject */
export default function JalaliDatePicker({ value, onChange, placeholder = "انتخاب تاریخ" }) {
  const { mode } = useTheme();
  return (
    <>
      <style>{`
        .rmdp-input { width: 100% !important; height: 42px !important; border-radius: 0.75rem !important; background-color: var(--input-bg) !important; color: var(--ink) !important; border: 1px solid var(--input-border) !important; font-size: 0.875rem !important; padding: 0.625rem 0.875rem !important; outline: none !important; }
        .rmdp-input:focus { border-color: var(--brand) !important; box-shadow: none !important; }
        .rmdp-input::placeholder { color: var(--muted-light); }
      `}</style>
      <DatePicker
        className={mode === "dark" ? "bg-dark" : ""}
        calendar={persian}
        locale={persian_fa}
        value={value}
        onChange={(d) => onChange(d?.isValid ? d : null)}
        calendarPosition="bottom-right"
        placeholder={placeholder}
      />
    </>
  );
}
