/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // بک‌اند بعد از پرداخت به /dashboard/subscription?result=... ریدایرکت می‌کند؛
      // صفحهٔ واقعی در /subscription است. query string (مثل result) خودکار حفظ می‌شود.
      {
        source: "/dashboard/subscription",
        destination: "/subscription",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
