import { useEffect, useRef, type CSSProperties } from "react";
import { isSoftMotion } from "@/lib/motion";

const LINES = ["ALEXANDRE", "DIOGO"] as const;
const REST = 0.36;
const AMP = 1.05;
const MAX_FONT = 300;
const SWEEP_DELAY_MS = 1500;
const SWEEP_MS = 1500;

/**
 * Nome em fonte variável: ajusta o tamanho para ocupar a largura toda e, com o cursor por perto,
 * alarga as letras próximas e estreita as distantes (o eixo wdth da Archivo), mantendo a largura total.
 */
export function HeroName({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h = ref.current;
    const hero = heroRef.current;
    if (!h || !hero) return;
    const lines = Array.from(h.querySelectorAll<HTMLElement>(".ln"));
    const parent = h.parentElement!;

    const fit = () => {
      h.style.fontSize = "100px";
      const stacked = getComputedStyle(h).flexDirection === "column";
      const ws = lines.map((l) => l.getBoundingClientRect().width);
      const total = stacked ? Math.max(...ws) : ws.reduce((a, b) => a + b, 0) + 42 * (ws.length - 1);
      const avail = parent.clientWidth - parseFloat(getComputedStyle(parent).paddingLeft) * 2;
      if (total > 0 && avail > 0) h.style.fontSize = `${Math.min(MAX_FONT, (100 * avail * 0.985) / total)}px`;
    };

    let px: number | null = null;
    let py: number | null = null;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const fs = parseFloat(h.style.fontSize) || 120;
      const sx = fs * 0.5;
      const sy = fs * 0.95;
      for (const ln of lines) {
        const ch = Array.from(ln.children) as HTMLElement[];
        if (px === null || py === null) {
          ch.forEach((c) => c.style.removeProperty("--w"));
          continue;
        }
        const g = ch.map((c) => {
          const r = c.getBoundingClientRect();
          const dx = px! - (r.left + r.width / 2);
          const dy = py! - (r.top + r.height / 2);
          return Math.exp(-(dx * dx) / (2 * sx * sx) - (dy * dy) / (2 * sy * sy));
        });
        const mean = g.reduce((a, b) => a + b, 0) / g.length;
        ch.forEach((c, i) => {
          const w = Math.max(0, Math.min(1, REST + AMP * ((g[i] ?? 0) - mean)));
          c.style.setProperty("--w", (62 + 63 * w).toFixed(1));
        });
      }
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    let user = false;
    const portrait = hero.querySelector<HTMLElement>(".portrait");
    const move = (e: PointerEvent) => {
      if (isSoftMotion()) return;
      user = true;
      px = e.clientX;
      py = e.clientY;
      req();
      if (portrait && e.pointerType !== "touch") {
        const hr = hero.getBoundingClientRect();
        portrait.style.setProperty("--hx", ((e.clientX - hr.left) / hr.width - 0.5).toFixed(3));
        portrait.style.setProperty("--hy", ((e.clientY - hr.top) / hr.height - 0.5).toFixed(3));
      }
    };
    const leave = () => {
      px = py = null;
      req();
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    const ro = new ResizeObserver(() => fit());
    ro.observe(parent);
    fit();
    document.fonts?.ready.then(fit).catch(() => undefined);

    // Uma passada automática do "cursor" pelo nome, uma vez, para mostrar o efeito.
    let sweepTimer = 0;
    const sweep = () => {
      if (isSoftMotion() || user || !h.isConnected) return;
      const r = h.getBoundingClientRect();
      const t0 = performance.now();
      const step = (t: number) => {
        if (user || !h.isConnected) return;
        const k = Math.min(1, (t - t0) / SWEEP_MS);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        px = r.left - r.width * 0.12 + e * r.width * 1.24;
        py = r.top + r.height / 2;
        paint();
        if (k < 1) requestAnimationFrame(step);
        else {
          px = py = null;
          paint();
        }
      };
      requestAnimationFrame(step);
    };
    const scheduleSweep = () => {
      sweepTimer = window.setTimeout(sweep, SWEEP_DELAY_MS);
    };
    if (document.documentElement.dataset.booting === "1") window.addEventListener("nasck:booted", scheduleSweep, { once: true });
    else scheduleSweep();

    return () => {
      ro.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      window.removeEventListener("nasck:booted", scheduleSweep);
      window.clearTimeout(sweepTimer);
      cancelAnimationFrame(raf);
    };
  }, [heroRef]);

  let gi = 0;
  return (
    <h1 className="hero-name" id="hero-name" aria-label="Alexandre Diogo" ref={ref}>
      {LINES.map((word) => (
        <span className="ln" key={word} aria-hidden="true">
          {word.split("").map((c) => (
            <span className="ch" key={gi} style={{ "--i": gi++ } as CSSProperties}>
              {c}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
