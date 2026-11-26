import { useEffect, type RefObject } from "react";
import { nf } from "@/data/site";
import { isSoftMotion } from "@/lib/motion";

/** Blocos que entram com animação ao aparecer na tela (mesma lista do design). */
const RV =
  ".hero-top,.hero-role,.hero-intro .low,.portrait,.hero-side > *,.marquee,.sec-head,.view-head > *,.pcard,.prow,.principle,.states > *,.teaser a,.block,.proof .tile,.gallery,.next,.lantern,.study,.code-tab,.code-win,.repo-list li,.me,.about .sheet,.xp,.edu li,.ct-grid > *,.spot-tabs,.spot-stage,.xgroup,.xpanel,.fact,.feat-card,.jspot > *,.gband,.ghband,.chap-head,.codepanel > *,.jobc,.nf-card";

const CLEANUP_MS = 1900;
const MAX_STAGGER = 7;

/** Espera a abertura (boot) terminar antes de revelar, para a animação não acontecer escondida. */
function afterBoot(fn: () => void): () => void {
  if (document.documentElement.dataset.booting !== "1") {
    fn();
    return () => undefined;
  }
  const on = () => fn();
  window.addEventListener("nasck:booted", on, { once: true });
  return () => window.removeEventListener("nasck:booted", on);
}

function countUp(el: HTMLElement) {
  const to = Number(el.dataset.to);
  if (!Number.isFinite(to)) return;
  const t0 = performance.now();
  const dur = 1100;
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = nf(Math.round(to * (1 - Math.pow(1 - k, 3))));
    if (k < 1 && el.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Revela os blocos da página conforme entram na tela; desligado no movimento suave. */
export function useReveal(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = ref.current;
    if (!root || isSoftMotion() || typeof IntersectionObserver === "undefined") return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(RV));
    const counters = Array.from(root.querySelectorAll<HTMLElement>(".cnt"));
    const perParent = new Map<Element | null, number>();
    for (const e of els) {
      const i = perParent.get(e.parentElement) ?? 0;
      perParent.set(e.parentElement, i + 1);
      e.style.setProperty("--d", String(Math.min(i, MAX_STAGGER)));
      e.setAttribute("data-rv", "");
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const e = en.target as HTMLElement;
          io.unobserve(e);
          if (e.classList.contains("cnt")) {
            countUp(e);
            continue;
          }
          e.classList.add("in");
          timers.push(
            window.setTimeout(() => {
              e.removeAttribute("data-rv");
              e.classList.remove("in");
              e.style.removeProperty("--d");
            }, CLEANUP_MS),
          );
        }
      },
      { rootMargin: "0px 0px -5% 0px" },
    );
    const stop = afterBoot(() => [...els, ...counters].forEach((e) => io.observe(e)));
    return () => {
      stop();
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      for (const e of els) {
        e.removeAttribute("data-rv");
        e.classList.remove("in");
      }
    };
  }, [ref]);
}
