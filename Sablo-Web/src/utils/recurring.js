import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toPersianNum } from "@/utils/formatters";

export const FREQUENCIES = [
  { key: "DAILY", label: "روزانه" },
  { key: "WEEKLY", label: "هفتگی" },
  { key: "MONTHLY", label: "ماهانه" },
  { key: "YEARLY", label: "سالانه" },
];

// dayOfWeek مثل getDay جاوااسکریپت: ۰ = یکشنبه ... ۶ = شنبه
// ترتیب نمایش از شنبه شروع می‌شود (هفته‌ی ایرانی)
export const WEEKDAY_CHIPS = [
  { v: 6, label: "شنبه" },
  { v: 0, label: "یکشنبه" },
  { v: 1, label: "دوشنبه" },
  { v: 2, label: "سه‌شنبه" },
  { v: 3, label: "چهارشنبه" },
  { v: 4, label: "پنجشنبه" },
  { v: 5, label: "جمعه" },
];
export const WEEKDAY_NAME = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

export const MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

/** متن خلاصه‌ی زمان‌بندی، مثلاً «هر ماه، روز ۵ام» */
export function scheduleText(frequency, dayOfWeek, dayOfMonth, monthOfYear) {
  switch (frequency) {
    case "DAILY":
      return "هر روز";
    case "WEEKLY":
      return `هر هفته، ${WEEKDAY_NAME[dayOfWeek ?? 6]}`;
    case "MONTHLY":
      return `هر ماه، روز ${toPersianNum(dayOfMonth ?? 1)}ام`;
    case "YEARLY":
      return `هر سال، ${toPersianNum(dayOfMonth ?? 1)} ${MONTHS[(monthOfYear ?? 1) - 1]}`;
    default:
      return "";
  }
}

/**
 * ISO (نیمه‌شب UTC) → DateObject شمسی برای JalaliDatePicker.
 * از اجزای UTC استفاده می‌کند تا دقیقاً با dateObjectToIso و اپ موبایل هم‌خوان باشد
 * و در هر منطقه‌ی زمانی یک روز جابه‌جا نشود.
 */
export function isoToDateObject(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new DateObject({
    calendar: gregorian,
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  }).convert(persian, persian_fa);
}

/** ISO → «۱۴۰۵/۰۸/۱۲» (همان خروجی formatJalaliFromIso اپ موبایل) */
export function formatJalaliFromIso(iso) {
  const d = isoToDateObject(iso);
  return d ? toPersianNum(d.format("YYYY/MM/DD")) : "";
}
