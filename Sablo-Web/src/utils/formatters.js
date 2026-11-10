export function toEnglishDigits(value) {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  return String(value)
    .split("")
    .map((ch) => {
      const pIndex = persian.indexOf(ch);
      if (pIndex > -1) return String(pIndex);
      const aIndex = arabic.indexOf(ch);
      if (aIndex > -1) return String(aIndex);
      return ch;
    })
    .join("");
}

export function sanitizeDigits(raw) {
  return toEnglishDigits(raw).replace(/\D/g, "");
}

export function toPersianNum(n) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

// "1234567" → "1,234,567" (برای نمایش داخل input)
export function formatAmountInput(digits) {
  return digits ? Number(digits).toLocaleString("en-US") : "";
}
