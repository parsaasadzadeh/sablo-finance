"use client";
import { Check } from "lucide-react";
import Sheet from "@/components/shared/Sheet";

/** انتخابگر (دسته‌بندی / کارت / منبع درآمد). options: [{id, label, icon?}] — id=null یعنی «بدون ...» */
export default function PickerSheet({ isOpen, title, options, selectedId, onSelect, onClose, emptyText }) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={title}>
      <ul className="space-y-1">
        {options.length === 0 && (
          <li className="text-xs text-[color:var(--muted)] text-center py-5">{emptyText ?? "موردی وجود ندارد"}</li>
        )}
        {options.map((o) => {
          const selected = o.id === selectedId;
          return (
            <li key={String(o.id)}>
              <button
                type="button"
                onClick={() => { onSelect(o.id); onClose(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-right transition-colors ${
                  selected ? "bg-[var(--brand-light)]" : "hover:bg-[var(--hover)]"
                }`}
              >
                {o.icon ? <span className="text-lg">{o.icon}</span> : null}
                <span className="flex-1 text-[13px] text-[color:var(--ink)]">{o.label}</span>
                {selected && <Check size={18} className="text-[color:var(--brand)]" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
