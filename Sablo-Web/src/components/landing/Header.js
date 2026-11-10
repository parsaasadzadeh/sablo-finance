"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Download, ChevronDown, User } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const navItems = [
    { href: "/", label: "خانه" },
    { href: "#features", label: "ویژگی‌ها" },
    { href: "#testimonials", label: "نظرات کاربران" },
    { href: "/about", label: "درباره ما" }
  ];

  return (
    <header
      dir="rtl"
      className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo — right side in RTL */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🌿</span>
          <span className="font-extrabold text-xl text-[#0F6F5C] tracking-tight">
            سابلو
          </span>
        </Link>

        {/* Nav — center */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6B6860]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#0F6F5C] transition-colors relative group pb-0.5"
            >
              {item.label}
              <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#0F6F5C] group-hover:w-full transition-all duration-200 rounded-full" />
            </a>
          ))}
        </nav>

        {/* Actions — left side in RTL */}
        <div className="hidden md:flex items-center gap-3">
          {/* Download dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDownloadOpen((p) => !p)}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#26241F] border border-[#DDD9D0] px-4 py-2 rounded-xl hover:bg-[#F7F4EE] transition-colors"
            >
              <Download size={15} />
              دانلود اپ
              <ChevronDown
                size={14}
                className={`transition-transform ${downloadOpen ? "rotate-180" : ""}`}
              />
            </button>

            {downloadOpen && (
              <div className="absolute left-0 mt-2 w-44 bg-white border border-[#EDE8DC] rounded-2xl shadow-lg py-2 z-50">
                <a
                  href="https://cafebazaar.ir/app/com.sabloapp.sablo"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#26241F] hover:bg-[#F7F4EE] transition-colors"
                >
                  <span>🛒</span> دانلود از بازار
                </a>
                <a
                  href="https://myket.ir/app/com.sabloapp.sablo"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#26241F] hover:bg-[#F7F4EE] transition-colors"
                >
                  <span>🟦</span> دانلود از مایکت
                </a>
              </div>
            )}
          </div>

          {/* Login */}
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
          >
            <User size={15} />
            ورود
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="باز و بسته کردن منو"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F1EFE9] text-[#0F6F5C] hover:bg-[#0F6F5C]/10 transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[400px]" : "max-h-0"
        }`}
      >
        <nav
          dir="rtl"
          className="flex flex-col gap-1 px-6 pb-4 pt-2 text-sm font-medium text-[#6B6860] border-t border-[#EDE8DC] bg-white"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3 px-3 rounded-xl hover:bg-[#F7F4EE] hover:text-[#0F6F5C] transition-colors"
            >
              {item.label}
            </a>
          ))}

          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#EDE8DC]">
            <a
              href="https://cafebazaar.ir/app/com.sabloapp.sablo"
              className="flex items-center gap-2 py-3 px-3 rounded-xl hover:bg-[#F7F4EE] text-[#26241F] transition-colors"
            >
              <Download size={15} /> دانلود از بازار
            </a>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#0F6F5C] hover:bg-[#0C5A4A] text-white font-bold px-5 py-3 rounded-xl transition-all"
            >
              <User size={15} /> ورود
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
