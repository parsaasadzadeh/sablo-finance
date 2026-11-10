"use client";
import { Tag } from "lucide-react";
import ManageItemsContent from "@/components/manage/ManageItemsContent";

const CONFIG = {
  title: "مدیریت دسته‌بندی‌ها",
  hint: null,
  listUrl: "/finance/categories",
  listKey: "categories",
  createUrl: "/finance/categories/custom",
  itemUrl: (id) => `/finance/categories/custom/${id}`,
  itemKey: "category",
  isEditable: (c) => !!c.isCustom,
  defaultIcon: "🏷️",
  emptyIcon: Tag,
  emptyTitle: "هنوز دسته‌بندی شخصی نساخته‌ای",
  emptySub: "مثلاً «گازوئیل» یا «شهریه»",
  addLabel: "دسته‌بندی جدید",
  createTitle: "دسته‌بندی جدید",
  editTitle: "ویرایش دسته‌بندی",
  namePlaceholder: "نام دسته‌بندی",
  nameRequired: "نام دسته‌بندی را وارد کنید",
  deleteTitle: "حذف دسته‌بندی",
  deleteMessage: (c) =>
    `دسته‌بندی «${c.label}» حذف شود؟\nتراکنش‌های این دسته به «سایر» منتقل می‌شوند و بودجه‌ی آن هم حذف می‌شود.`,
  presetsTitle: "دسته‌بندی‌های پیش‌فرض",
  presetsHint: "این‌ها قابل ویرایش یا حذف نیستند.",
};

export default function CategoriesPage() {
  return <ManageItemsContent config={CONFIG} />;
}
