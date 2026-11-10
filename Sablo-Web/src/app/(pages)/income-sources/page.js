"use client";
import { Banknote } from "lucide-react";
import ManageItemsContent from "@/components/manage/ManageItemsContent";

const CONFIG = {
  title: "مدیریت منابع درآمد",
  hint:
    "منبع درآمد را خودت می‌سازی (مثلاً «حقوق شرکت» یا «پروژه‌ی فریلنس») و موقع ثبت هر درآمد انتخابش می‌کنی. در گزارش‌ها درآمدها به تفکیک منبع نمایش داده می‌شوند.",
  listUrl: "/finance/income-sources",
  listKey: "incomeSources",
  createUrl: "/finance/income-sources",
  itemUrl: (id) => `/finance/income-sources/${id}`,
  itemKey: "incomeSource",
  isEditable: () => true, // منابع درآمد کاملاً اختصاصی کاربرند؛ لیست پیش‌فرض ندارند
  defaultIcon: "💰",
  emptyIcon: Banknote,
  emptyTitle: "هنوز منبع درآمدی نساخته‌ای",
  emptySub: "مثلاً «حقوق»، «اجاره» یا «فریلنس»",
  addLabel: "منبع درآمد جدید",
  createTitle: "منبع درآمد جدید",
  editTitle: "ویرایش منبع درآمد",
  namePlaceholder: "نام منبع درآمد",
  nameRequired: "نام منبع درآمد را وارد کنید",
  deleteTitle: "حذف منبع درآمد",
  deleteMessage: (s) =>
    `منبع درآمد «${s.label}» حذف شود؟\nدرآمدهای ثبت‌شده‌ی این منبع حذف نمی‌شوند و فقط «بدون منبع» می‌شوند.`,
  presetsTitle: "",
  presetsHint: "",
};

export default function IncomeSourcesPage() {
  return <ManageItemsContent config={CONFIG} />;
}
