"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Send, Zap, CircleHelp, Loader2 } from "lucide-react";
import useAiChat from "./useAiChat";
import { MAX_TEXT_LENGTH } from "./constants";
import GuideCard from "./GuideCard";
import DraftCard from "./DraftCard";
import PickerSheet from "./PickerSheet";

// در صفحه‌ی راست‌به‌چپ: self-start = سمت راست (کاربر)، self-end = سمت چپ (دستیار)
const BUBBLE = "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-[21px] whitespace-pre-wrap break-words";

export default function AiChatContent() {
  const router = useRouter();
  const chat = useAiChat();
  const { messages, sending } = chat;

  const [input, setInput] = useState("");
  const [picker, setPicker] = useState(null); // { kind: 'category' | 'card' | 'source', draftId }
  const textareaRef = useRef(null);
  const endRef = useRef(null);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/dashboard");
  };

  // اسکرول به آخر چت (وقتی فقط راهنما هست، بالای صفحه می‌ماند)
  useEffect(() => {
    if (messages.length > 1 || sending) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  // ارتفاع خودکار تکست‌اریا (حداکثر ۱۱۰ پیکسل)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
  }, [input]);

  const handleSend = useCallback(
    (text) => {
      const value = String(text ?? input).trim();
      if (!value || sending) return;
      setInput("");
      chat.send(value);
    },
    [input, sending, chat]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── پیکر ───────────────────────────────────────────────────────────────
  const activeDraft = useMemo(() => {
    if (!picker) return null;
    const m = messages.find((x) => x.id === picker.draftId);
    return m && m.kind === "draft" ? m.draft : null;
  }, [picker, messages]);

  const pickerConfig = useMemo(() => {
    if (!picker || !activeDraft) return null;
    if (picker.kind === "category") {
      return {
        title: "انتخاب دسته‌بندی",
        options: [
          { id: null, label: "بدون دسته‌بندی" },
          ...chat.categories.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
        ],
        selectedId: activeDraft.category,
        onSelect: (id) => chat.setDraftCategory(picker.draftId, id),
      };
    }
    if (picker.kind === "card") {
      return {
        title: "انتخاب کارت",
        options: [
          { id: null, label: "بدون کارت" },
          ...chat.cards.map((c) => ({ id: c._id, label: c.name, icon: c.icon })),
        ],
        selectedId: activeDraft.cardId,
        onSelect: (id) => chat.setDraftCard(picker.draftId, id),
      };
    }
    return {
      title: "انتخاب منبع درآمد",
      options: [
        { id: null, label: "بدون منبع" },
        ...chat.incomeSources.map((s) => ({ id: s.id, label: s.label, icon: s.icon })),
      ],
      selectedId: activeDraft.incomeSourceId,
      onSelect: (id) => chat.setDraftIncomeSource(picker.draftId, id),
      emptyText: "هنوز منبع درآمدی نساخته‌اید",
    };
  }, [picker, activeDraft, chat]);

  const canSend = input.trim().length > 0 && !sending;

  return (
    <div dir="rtl" lang="fa" className="h-dvh flex flex-col bg-[var(--bg)] text-[color:var(--ink)]">
      {/* هدر */}
      <header className="flex items-center px-4 py-3 border-b border-[color:var(--border)] bg-[var(--card)]">
        <button
          onClick={goBack}
          aria-label="بازگشت"
          className="w-8 flex items-center justify-start text-[color:var(--ink)]"
        >
          <ArrowRight size={22} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <Zap size={16} className="text-[color:var(--brand)]" fill="currentColor" />
          <h1 className="text-base font-bold">ثبت تراکنش با سرعت نور</h1>
        </div>
        <button
          onClick={chat.showGuide}
          aria-label="راهنما"
          className="w-8 flex items-center justify-end text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
        >
          <CircleHelp size={22} />
        </button>
      </header>

      {/* پیام‌ها */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full p-4 flex flex-col gap-2.5">
          {messages.map((m) => {
            switch (m.kind) {
              case "guide":
                return <GuideCard key={m.id} onPickExample={handleSend} disabled={sending} />;

              case "user":
                return (
                  <div key={m.id} className={`${BUBBLE} self-start bg-[var(--brand)] text-white`}>
                    {m.text}
                  </div>
                );

              case "assistant": {
                const tone = m.tone ?? "normal";
                const toneCls =
                  tone === "error"
                    ? "bg-[var(--danger-light)] border-[color:var(--danger-border)] text-[color:var(--danger)]"
                    : tone === "success"
                    ? "bg-[var(--emerald-bg)] border-[color:var(--emerald-mid)] text-[color:var(--emerald-text)]"
                    : "bg-[var(--card)] border-[color:var(--border)] text-[color:var(--ink)]";
                return (
                  <div key={m.id} className={`${BUBBLE} self-end border ${toneCls}`}>
                    {m.text}
                  </div>
                );
              }

              case "draft":
                return (
                  <div key={m.id} className="self-end w-full max-w-[92%] sm:max-w-sm">
                    <DraftCard
                      draft={m.draft}
                      onConfirm={() => chat.confirmDraft(m.id)}
                      onCancel={() => chat.cancelDraft(m.id)}
                      onChangeType={(t) => chat.setDraftType(m.id, t)}
                      onPickCategory={() => setPicker({ kind: "category", draftId: m.id })}
                      onPickCard={() => setPicker({ kind: "card", draftId: m.id })}
                      onPickIncomeSource={() => setPicker({ kind: "source", draftId: m.id })}
                    />
                  </div>
                );

              default:
                return null;
            }
          })}

          {sending && (
            <div
              className={`${BUBBLE} self-end border bg-[var(--card)] border-[color:var(--border)] flex items-center gap-2`}
              role="status"
            >
              <Loader2 size={16} className="animate-spin text-[color:var(--brand)]" />
              <span>در حال بررسی…</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* ورودی */}
      <div className="border-t border-[color:var(--border)] bg-[var(--card)] px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto w-full flex items-end gap-2">
          <div className="flex-1 bg-[var(--input-bg)] border border-[color:var(--input-border)] focus-within:border-[color:var(--brand)] rounded-[20px] px-3.5 py-2.5 transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              readOnly={sending}
              maxLength={MAX_TEXT_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="مثلاً: دیروز ۸۰ هزار تومن بنزین زدم"
              aria-label="متن تراکنش"
              className="w-full resize-none bg-transparent outline-none text-[13px] leading-[21px] text-right text-[color:var(--ink)] placeholder:text-[color:var(--muted-light)] max-h-[110px]"
            />
            {input.length > MAX_TEXT_LENGTH - 60 && (
              <p className="text-[10px] text-[color:var(--muted)] text-left mt-0.5">
                {(MAX_TEXT_LENGTH - input.length).toLocaleString("fa-IR")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!canSend}
            aria-label="ارسال"
            className="w-11 h-11 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] disabled:bg-[var(--input-border)] disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors"
          >
            {/* در راست‌به‌چپ آیکن ارسال باید به سمت چپ نگاه کند */}
            <Send size={18} className="text-white" style={{ transform: "scaleX(-1)" }} />
          </button>
        </div>
      </div>

      {pickerConfig && (
        <PickerSheet
          isOpen
          title={pickerConfig.title}
          options={pickerConfig.options}
          selectedId={pickerConfig.selectedId}
          onSelect={pickerConfig.onSelect}
          onClose={() => setPicker(null)}
          emptyText={pickerConfig.emptyText}
        />
      )}
    </div>
  );
}
