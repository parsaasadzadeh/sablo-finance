// ثابت‌های مشترک بخش چک‌ها (هم‌معنی types.ts در اپ اندروید)
// direction: PAYABLE = پرداختی | RECEIVABLE = دریافتی
// status:    PENDING | CLEARED | BOUNCED | CANCELLED
// amount:    همیشه ریال (مثل بقیه‌ی مبالغ بک‌اند)

export const EMPTY_BUCKET = { total: 0, count: 0, overdueCount: 0, overdueAmount: 0 };

export const EMPTY_SUMMARY = {
  payable: EMPTY_BUCKET,
  receivable: EMPTY_BUCKET,
  net: 0, // مثبت = دریافتی‌های در جریان بیشتر از پرداختی‌هاست
};

export const STATUS_LABEL = {
  PENDING: "در جریان",
  CLEARED: "پاس شده",
  BOUNCED: "برگشتی",
  CANCELLED: "باطل",
};
