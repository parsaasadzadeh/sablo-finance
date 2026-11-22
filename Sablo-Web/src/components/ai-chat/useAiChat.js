"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useCard } from "@/context/cardContext";
import { emitSessionCleared } from "@/lib/subscriptionBus";
import { MAX_TEXT_LENGTH } from "./constants";

const REQUEST_TIMEOUT_MS = 35000; // بک‌اند خودش بعد از ۲۵ ثانیه قطع می‌کند
const GUIDE_MESSAGE = { id: "guide", kind: "guide" };

/**
 * منطق چت «ثبت تراکنش با سرعت نور».
 *
 * انواع پیام: guide | user | assistant{tone} | draft{draft}
 * وضعیت draft: pending | saving | saved | cancelled
 */
export default function useAiChat() {
  const router = useRouter();
  const { cards } = useCard();

  const [categories, setCategories] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [messages, setMessages] = useState([GUIDE_MESSAGE]);
  const [sending, setSending] = useState(false);

  // بک‌اند تاریخچه ندارد؛ وقتی AI سؤال می‌پرسد، متن قبلی را به جواب کاربر می‌چسبانیم
  const clarifyBaseRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const sendingRef = useRef(false);
  const idRef = useRef(0);
  const nextId = useCallback(() => `m${++idRef.current}`, []);

  useEffect(() => {
    let cancelled = false;
    api.get("/finance/categories")
      .then((res) => {
        if (cancelled) return;
        const d = res.data;
        setCategories(d?.categories ?? (Array.isArray(d) ? d : []));
      })
      .catch(() => {});
    api.get("/finance/income-sources")
      .then((res) => { if (!cancelled) setIncomeSources(res.data?.incomeSources ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const kickToLogin = useCallback(() => {
    try { localStorage.removeItem("token"); } catch {}
    emitSessionCleared();
    router.replace("/");
  }, [router]);

  const pushAssistant = useCallback(
    (text, tone = "normal") => {
      setMessages((prev) => [...prev, { id: nextId(), kind: "assistant", text, tone }]);
    },
    [nextId]
  );

  const patchDraft = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.kind === "draft" ? { ...m, draft: { ...m.draft, ...patch } } : m))
    );
  }, []);

  // ── ارسال متن به AI ──────────────────────────────────────────────────────
  const send = useCallback(
    async (raw) => {
      const text = String(raw ?? "").trim().slice(0, MAX_TEXT_LENGTH);
      if (!text || sendingRef.current) return;

      sendingRef.current = true;
      setSending(true);
      setMessages((prev) => [...prev, { id: nextId(), kind: "user", text }]);

      let payload = text;
      if (clarifyBaseRef.current) {
        const combined = `${clarifyBaseRef.current} ${text}`;
        payload = combined.length <= MAX_TEXT_LENGTH ? combined : text;
      }

      try {
        const res = await api.post("/ai/parse-transaction", { text: payload }, { timeout: REQUEST_TIMEOUT_MS });
        const data = res.data;

        if (data.needsClarification) {
          clarifyBaseRef.current = payload;
          pushAssistant(data.message || "لطفاً مبلغ و نوع تراکنش را دقیق‌تر بنویسید");
        } else if (data.draft) {
          clarifyBaseRef.current = null;
          const draft = { ...data.draft, incomeSourceId: null, incomeSourceLabel: null, status: "pending" };
          setMessages((prev) => [...prev, { id: nextId(), kind: "draft", draft }]);
        } else {
          clarifyBaseRef.current = null;
          pushAssistant("متوجه نشدم، لطفاً دوباره و واضح‌تر بنویسید", "error");
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) { kickToLogin(); return; }
        if (err?.isSubscriptionExpired) {
          // SubscriptionExpiredPrompt خودش پیام را نشان می‌دهد؛ اینجا فقط توضیح داخل چت
          pushAssistant("اشتراک شما تمام شده؛ برای استفاده از ثبت هوشمند اشتراک را تمدید کنید.", "error");
          return;
        }
        // خطای ۴xx = متن مشکل داشته → زمینه‌ی قبلی رها شود. خطای شبکه/سرور → نگه داشته شود
        if (status && status < 500) clarifyBaseRef.current = null;
        pushAssistant(
          err?.response?.data?.message ||
            (err?.code === "ECONNABORTED"
              ? "پاسخ هوش مصنوعی طول کشید، دوباره تلاش کنید"
              : "ارتباط با سرور برقرار نشد، اینترنت را بررسی کنید"),
          "error"
        );
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [nextId, pushAssistant, kickToLogin]
  );

  // ── تأیید نهایی → همان روت /finance/add ───────────────────────────────────
  const confirmDraft = useCallback(
    async (id) => {
      const msg = messagesRef.current.find((m) => m.id === id);
      if (!msg || msg.kind !== "draft" || msg.draft.status !== "pending") return;
      const d = msg.draft;

      patchDraft(id, { status: "saving" });
      try {
        await api.post("/finance/add", {
          type: d.type,
          amount: d.amount, // ریال
          title: d.title,
          description: d.description,
          category: d.category,
          cardId: d.cardId,
          date: d.date,
          incomeSourceId: d.type === "INCOME" ? d.incomeSourceId : undefined,
        });
        patchDraft(id, { status: "saved" });
        pushAssistant("تراکنش ثبت شد ✅ هر تراکنش دیگه‌ای هم داری بنویس.", "success");
      } catch (err) {
        patchDraft(id, { status: "pending" });
        if (err?.response?.status === 401) { kickToLogin(); return; }
        if (err?.isSubscriptionExpired) return; // پیام اشتراک از prompt سراسری نشان داده می‌شود
        pushAssistant(err?.response?.data?.message || "ثبت تراکنش انجام نشد، دوباره تلاش کنید", "error");
      }
    },
    [patchDraft, pushAssistant, kickToLogin]
  );

  const cancelDraft = useCallback((id) => patchDraft(id, { status: "cancelled" }), [patchDraft]);

  // ── ویرایش پیش‌نویس قبل از ثبت ────────────────────────────────────────────
  const setDraftType = useCallback((id, type) => patchDraft(id, { type }), [patchDraft]);

  const setDraftCategory = useCallback(
    (id, categoryId) => {
      const cat = categories.find((c) => c.id === categoryId);
      patchDraft(id, {
        category: categoryId,
        categoryLabel: cat?.label ?? null,
        categoryIcon: cat?.icon ?? null,
      });
    },
    [categories, patchDraft]
  );

  const setDraftCard = useCallback(
    (id, cardId) => {
      const card = cards.find((c) => c._id === cardId);
      patchDraft(id, { cardId, cardName: card?.name ?? null });
    },
    [cards, patchDraft]
  );

  const setDraftIncomeSource = useCallback(
    (id, sourceId) => {
      const src = incomeSources.find((s) => s.id === sourceId);
      patchDraft(id, { incomeSourceId: sourceId, incomeSourceLabel: src?.label ?? null });
    },
    [incomeSources, patchDraft]
  );

  // آموزش دوباره: قبلی را حذف و آخر چت اضافه می‌کند
  const showGuide = useCallback(() => {
    setMessages((prev) => [...prev.filter((m) => m.kind !== "guide"), { ...GUIDE_MESSAGE, id: nextId() }]);
  }, [nextId]);

  return {
    messages, sending, send,
    confirmDraft, cancelDraft,
    setDraftType, setDraftCategory, setDraftCard, setDraftIncomeSource,
    showGuide,
    categories, cards, incomeSources,
  };
}
