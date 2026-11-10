/**
 * تبدیل رشته تاریخ ISO یا میلادی به رشته تاریخ محلی و خوانای جلالی (شمسی)
 * @param {string} dateString - تاریخ ورودی به صورت استاندارد میلادی
 * @returns {string} تاریخ شمسی با اعداد محلی
 */
export const formatJalaliDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(new Date(dateString));
};