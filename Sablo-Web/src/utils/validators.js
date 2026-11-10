export function isValidIranianMobile(value) {
  return /^09\d{9}$/.test(value);
}