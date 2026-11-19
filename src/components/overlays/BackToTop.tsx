import { useEffect, useRef } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { live, onScrollFrame, wake } from "@/lib/live";
import { ArrowUpIcon } from "@/components/ui/icons";

/** Distância mínima rolada antes de oferecer o botão (px ou 1,5 tela, o que for maior). */
const MIN_SCROLL = 900;
/** No celular o botão só aparece ao rolar para cima: é aí que a pessoa quer voltar. */
const COMPACT_W = 860;

export function BackToTop() {
  const { vp, scrollToId } = usePortfolio();
  const ref = useRef<HTMLButtonElement>(null);
  const state = useRef({ on: false, py: 0, up: false, nearFooter: false, compact: vp.w < COMPACT_W });
  state.current.compact = vp.w < COMPACT_W;

  // Esconde perto do rodapé, que já tem o próprio "Voltar ao topo".
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver((es) => {
      state.current.nearFooter = es.some((e) => e.isIntersecting);
      wake();
    });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  useEffect(
    () =>
      onScrollFrame(() => {
        const tb = ref.current;
        if (!tb) return;
        const s = state.current;
        const y = live.scrollY;
        const dy = y - s.py;
        s.py = y;
        if (Math.abs(dy) > 4) s.up = dy < 0;
        const far = y > Math.max(MIN_SCROLL, innerHeight * 1.5);
        const on = far && !s.nearFooter && (!s.compact || s.up);
        if (on === s.on) return;
        s.on = on;
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
      tabIndex={-1}
      onClick={() => scrollToId("topo")}
      aria-label="Voltar ao topo"
      className="glass-blur-sm glass-fixed fixed right-4 z-[55] grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-glass text-head shadow-card sm:right-5 sm:size-[52px]"
      style={{ bottom: "max(16px, env(safe-area-inset-bottom))", opacity: 0, transform: "translateY(16px) scale(.9)", pointerEvents: "none", transition: "opacity .3s,transform .35s cubic-bezier(.2,.8,.2,1)" }}
    >
      <ArrowUpIcon size={18} sw={2.2} />
    </button>
  );
}
