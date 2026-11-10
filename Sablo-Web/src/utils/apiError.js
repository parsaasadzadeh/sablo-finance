// نمایش خطای API با alert؛ اگر علت «اتمام اشتراک» باشد چیزی نشان نمی‌دهد چون
// SubscriptionExpiredPrompt خودش پیام دوستانه را نشان می‌دهد (و alert جلوی آن را می‌گرفت).
export function alertError(err, fallback) {
  if (err?.isSubscriptionExpired) return;
  alert(err?.response?.data?.message || fallback);
}

// برای مواردی که پیام در state نگه‌داری می‌شود؛ null یعنی پیامی نشان نده
export function errorText(err, fallback) {
  if (err?.isSubscriptionExpired) return null;
  return err?.response?.data?.message || fallback;
}
