"use client";
import Link from "next/link";
import { CheckCircle2, Layers, Plus } from "lucide-react";
import { useCard } from "@/context/cardContext";

// کارت‌های کاربر به شکل کارت بانکی (مثل اپ). انتخاب یک کارت = فیلتر کل داشبورد روی همان کارت.
const TILE =
  "relative shrink-0 w-40 h-[100px] snap-center overflow-hidden rounded-[18px] p-3.5 flex flex-col justify-between text-right border-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]";

function Circles() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -top-9 -left-8 h-[110px] w-[110px] rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-6 -right-4 h-[70px] w-[70px] rounded-full bg-white/10" />
    </>
  );
}

export default function CardsStrip() {
  const { cards, activeCard, setActiveCard, cardsLoading } = useCard();
  const allActive = !activeCard;

  return (
    <section
      aria-label="کارت‌های من"
      className="mb-4 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] px-4 pb-2 pt-4"
    >
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-[color:var(--ink)]">کارت‌های من</h2>
        <div className="flex items-center gap-3">
          {activeCard && (
            <button
              type="button"
              onClick={() => setActiveCard(null)}
              className="text-xs font-semibold text-[color:var(--rose-text)] hover:opacity-80"
            >
              حذف فیلتر
            </button>
          )}
          <Link href="/cards" className="text-xs font-semibold text-[color:var(--brand)] hover:opacity-80">
            مدیریت کارت‌ها
          </Link>
        </div>
      </div>

      {cardsLoading ? (
        <div className="flex gap-3 overflow-hidden py-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[100px] w-40 shrink-0 animate-pulse rounded-[18px] bg-[var(--bg)]" />
          ))}
        </div>
      ) : (
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 snap-x snap-proximity">
          {/* w-max + mx-auto: با تعداد کم وسط‌چین، با تعداد زیاد قابل اسکرول */}
          <div className="mx-auto flex w-max gap-3 py-3">
            {/* همه کارت‌ها */}
            <button
              type="button"
              aria-pressed={allActive}
              onClick={() => setActiveCard(null)}
              className={`${TILE} ${
                allActive
                  ? "border-white/90 bg-[var(--brand)] shadow-lg scale-[1.04]"
                  : "border-[color:var(--border)] bg-[var(--input-bg)]"
              }`}
            >
              {allActive && <Circles />}
              <div className="relative flex items-center justify-between">
                <Layers size={22} className={allActive ? "text-white" : "text-[color:var(--muted)]"} />
                {allActive ? <CheckCircle2 size={18} className="text-white" /> : <span className="h-[18px] w-[18px]" />}
              </div>
              <div className="relative">
                <p className={`truncate text-sm font-bold ${allActive ? "text-white" : "text-[color:var(--ink)]"}`}>
                  همه کارت‌ها
                </p>
                <p className={`truncate text-[10px] ${allActive ? "text-white/80" : "text-[color:var(--muted)]"}`}>
                  نمایش همه تراکنش‌ها
                </p>
              </div>
            </button>

            {cards.length === 0 ? (
              <Link
                href="/cards"
                className={`${TILE} items-center justify-center gap-1 border-dashed border-[color:var(--brand)] bg-[var(--input-bg)] text-[color:var(--brand)]`}
              >
                <Plus size={18} />
                <span className="text-xs font-semibold">هنوز کارتی نساختی</span>
              </Link>
            ) : (
              cards.map((card) => {
                const isActive = activeCard?._id === card._id;
                const dimmed = !!activeCard && !isActive;
                return (
                  <button
                    key={card._id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveCard(isActive ? null : card)}
                    className={`${TILE} text-white ${
                      isActive ? "border-white/90 shadow-lg scale-[1.04]" : "border-transparent shadow-sm"
                    } ${dimmed ? "opacity-50" : ""}`}
                    style={{ backgroundColor: card.color || "var(--brand)" }}
                  >
                    <Circles />
                    <div className="relative flex items-center justify-between">
                      <span className="text-[22px] leading-none">{card.icon}</span>
                      {isActive ? <CheckCircle2 size={18} /> : <span className="h-[18px] w-[18px]" />}
                    </div>
                    <div className="relative">
                      <p className="truncate text-sm font-bold">{card.name}</p>
                      <div className="mt-1.5 flex items-center gap-2" aria-hidden>
                        <span className="h-[17px] w-6 rounded bg-white/55" />
                        <span className="text-[11px] tracking-wider text-white/75">••••</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
}
