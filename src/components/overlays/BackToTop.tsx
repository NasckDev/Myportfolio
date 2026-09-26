import { useEffect, useRef } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { live, onFrame } from "@/lib/live";
import { ArrowUpIcon } from "@/components/ui/icons";

export function BackToTop() {
  const { scrollToId } = usePortfolio();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(
    () =>
      onFrame(() => {
        const tb = ref.current;
        if (!tb) return;
        const on = live.scrollY > 900;
        tb.style.opacity = on ? "1" : "0";
        tb.style.transform = on ? "none" : "translateY(16px) scale(.9)";
        tb.style.pointerEvents = on ? "auto" : "none";
        tb.tabIndex = on ? 0 : -1;
      }),
    [],
  );

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => scrollToId("topo")}
      aria-label="Voltar ao topo"
      className="fixed bottom-5 right-5 z-[55] grid size-[52px] cursor-pointer place-items-center rounded-full border border-line bg-glass text-head shadow-card"
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", opacity: 0, transform: "translateY(16px) scale(.9)", pointerEvents: "none", transition: "opacity .3s,transform .35s cubic-bezier(.2,.8,.2,1)" }}
    >
      <ArrowUpIcon size={18} sw={2.2} />
    </button>
  );
}
