import gregorian from "react-date-object/calendars/gregorian";

/**
 * تبدیل DateObject شمسی (خروجی DatePicker) به ISO نیمه‌شب UTC.
 * دقیقاً هم‌فرمت با اپ موبایل (PersianDatePicker) و بقیه‌ی فرم‌های وب،
 * تا تاریخ‌ها در هر دو پلتفرم یکی نمایش داده شوند.
 */
export function dateObjectToIso(d) {
  if (!d || !d.isValid) return undefined;
  const g = d.convert(gregorian);
  return new Date(Date.UTC(g.year, g.month.number - 1, g.day, 0, 0, 0, 0)).toISOString();
}
