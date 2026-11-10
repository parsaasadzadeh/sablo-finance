import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import RegisterSW from './register-sw';

import { CardProvider } from "@/context/cardContext";
import { ThemeProvider } from "@/context/themeContext";
import { SubscriptionProvider } from "@/context/subscriptionContext";
import TrialWelcomeModal from "@/components/subscription/TrialWelcomeModal";
import SubscriptionExpiredPrompt from "@/components/subscription/SubscriptionExpiredPrompt";

export const metadata = {
  metadataBase: new URL('https://sablo.ir'),
  title: {
    default: "Sablo | اپلیکیشن مدیریت مالی",
    template: "%s | Sablo",
  },
  description: "مدیریت هوشمند مالی، بودجه‌بندی و پیگیری هزینه‌ها با Sablo",
  manifest: "/manifest.json",
  applicationName: "Sablo",
  generator: "Next.js",
  keywords: ["مدیریت مالی", "بودجه‌بندی", "حسابداری شخصی", "Sablo"],
  authors: [{ name: "Sablo Team" }],
  icons: {
    icon: "/appicon.png",
    apple: "/appicon.png",
  },
  openGraph: {
    title: "Sablo | اپلیکیشن مدیریت مالی",
    description: "مدیریت هوشمند مالی",
    url: "https://sablo.ir",
    siteName: "Sablo",
    locale: "fa_IR",
    type: "website",
  },
  verification: {
    google: "CGCtTzflYGvFEb0EdXLfG_7stO1VlLMTPethm-ZuCsc",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  // یک مقدار ثابت (نه آرایه‌ی media-query)؛ ThemeProvider موقع تغییر تم این متا را به‌روز می‌کند
  themeColor: "#F7F4EE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// قبل از اولین رندر اجرا می‌شود تا با رفرش، صفحه‌ی سفید چشمک نزند
const themeScript = `
(function () {
  try {
    var m = localStorage.getItem('theme-mode') === 'dark' ? 'dark' : 'light';
    var r = document.documentElement;
    r.setAttribute('data-theme', m);
    r.classList.toggle('dark', m === 'dark');
    r.style.colorScheme = m;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-vazir antialiased">
        <ThemeProvider>
          <SubscriptionProvider>
            <CardProvider>{children}</CardProvider>
            <TrialWelcomeModal />
            <SubscriptionExpiredPrompt />
          </SubscriptionProvider>
        </ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
