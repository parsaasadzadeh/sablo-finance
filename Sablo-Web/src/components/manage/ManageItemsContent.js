"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import api from "@/lib/axios";
import { alertError, errorText } from "@/utils/apiError";
import PageShell from "@/components/shared/PageShell";
import Sheet, { LABEL, INPUT } from "@/components/shared/Sheet";

/**
 * صفحه‌ی مشترک «مدیریت دسته‌بندی‌ها» و «مدیریت منابع درآمد».
 * هر دو یک ساختار دارند: لیست {id, label, icon} با ساخت / ویرایش / حذف.
 * config از صفحه‌ی مربوطه می‌آید (آدرس‌های API و متن‌ها).
 */
export default function ManageItemsContent({ config }) {
  const {
    title, hint, listUrl, listKey, createUrl, itemUrl, itemKey,
    isEditable, defaultIcon, emptyIcon: EmptyIcon, emptyTitle, emptySub,
    addLabel, createTitle, editTitle, namePlaceholder, nameRequired,
    deleteTitle, deleteMessage, presetsTitle, presetsHint,
  } = config;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = ساخت جدید
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get(listUrl);
      setItems(res.data[listKey] ?? []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [listUrl, listKey]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditing(null); setLabel(""); setIcon(""); setFormError(null); setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item); setLabel(item.label); setIcon(item.icon ?? ""); setFormError(null); setFormOpen(true);
  };

  const closeForm = useCallback(() => { if (!formLoading) setFormOpen(false); }, [formLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formLoading) return;
    const trimmed = label.trim();
    if (!trimmed) return setFormError(nameRequired);

    setFormLoading(true);
    setFormError(null);
    try {
      const body = { label: trimmed, icon: icon.trim() };
      if (editing) {
        const res = await api.put(itemUrl(editing.id), body);
        const updated = res.data[itemKey];
        setItems((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      } else {
        const res = await api.post(createUrl, body);
        setItems((prev) => [...prev, res.data[itemKey]]);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(errorText(err, "خطا در ذخیره"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(deleteMessage(item))) return;
    try {
      await api.delete(itemUrl(item.id));
      setItems((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err) {
      alertError(err, "خطا در حذف");
    }
  };

  const mine = items.filter(isEditable);
  const presets = items.filter((i) => !isEditable(i));

  return (
    <PageShell title={title} actionLabel={addLabel} onAction={loading ? undefined : openCreate}>
      {hint && <p className="text-xs leading-6 text-[color:var(--muted)] mb-5">{hint}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[color:var(--brand)]" size={28} />
        </div>
      ) : loadError ? (
        <div className="text-center py-16">
          <p className="text-sm text-[color:var(--danger)] mb-3">دریافت اطلاعات با خطا مواجه شد</p>
          <button
            onClick={() => { setLoading(true); fetchItems(); }}
            className="text-xs font-bold text-[color:var(--brand)]"
          >
            تلاش دوباره
          </button>
        </div>
      ) : (
        <>
          {mine.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="w-16 h-16 bg-[var(--border)] rounded-full flex items-center justify-center">
                <EmptyIcon size={28} className="text-[color:var(--muted)]" />
              </div>
              <p className="text-sm font-semibold text-[color:var(--ink)]">{emptyTitle}</p>
              <p className="text-xs text-[color:var(--muted)]">{emptySub}</p>
              <button
                onClick={openCreate}
                className="mt-2 bg-[var(--brand)] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--brand-dark)] transition-colors"
              >
                {addLabel}
              </button>
            </div>
          ) : (
            <ul className="grid gap-2.5">
              {mine.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 bg-[var(--card)] rounded-2xl border border-[color:var(--border)] px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{item.icon || defaultIcon}</span>
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      aria-label={`ویرایش ${item.label}`}
                      className="p-2 rounded-lg text-[color:var(--info)] hover:bg-[var(--info-light)] transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      aria-label={`حذف ${item.label}`}
                      className="p-2 rounded-lg text-[color:var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {mine.length > 0 && (
            <button
              onClick={openCreate}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[color:var(--border)] py-3 text-sm font-bold text-[color:var(--brand)] hover:bg-[var(--brand-light)] transition-colors"
            >
              <Plus size={18} /> {addLabel}
            </button>
          )}

          {presets.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-bold mb-1">{presetsTitle}</h2>
              <p className="text-xs text-[color:var(--muted)] mb-3">{presetsHint}</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <span
                    key={p.id}
                    className="flex items-center gap-1.5 bg-[var(--card)] border border-[color:var(--border)] rounded-xl px-3 py-1.5 text-xs"
                  >
                    <span>{p.icon}</span>{p.label}
                  </span>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Sheet isOpen={formOpen} onClose={closeForm} title={editing ? editTitle : createTitle}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="w-20 shrink-0">
              <label className={LABEL} htmlFor="mi-icon">آیکن</label>
              <input
                id="mi-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="😀"
                maxLength={4}
                className={`${INPUT} text-center text-lg`}
              />
            </div>
            <div className="flex-1">
              <label className={LABEL} htmlFor="mi-label">نام</label>
              <input
                id="mi-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={namePlaceholder}
                maxLength={30}
                autoFocus
                className={`${INPUT} text-right`}
              />
            </div>
          </div>

          {formError && (
            <div className="bg-[var(--danger-light)] border border-[color:var(--danger-border)] rounded-xl px-4 py-3">
              <p className="text-xs text-[color:var(--danger)] text-right">{formError}</p>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:opacity-70 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              {editing ? "ذخیره تغییرات" : "ساخت"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="bg-[var(--bg)] border border-[color:var(--border)] text-[color:var(--ink)] font-semibold rounded-xl px-4 py-2.5 text-xs hover:bg-[var(--hover)] transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </Sheet>
    </PageShell>
  );
}
