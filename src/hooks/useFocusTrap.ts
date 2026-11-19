import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
const LANDMARKS = "header, main, footer";

/**
 * Quantos diálogos pediram `inert` em cada região de fundo. O atributo só sai quando o último
 * diálogo fechar, e nunca é removido de um elemento que já estava inerte antes (ex.: prop do React).
 */
const inertOwners = new Map<HTMLElement, { count: number; owned: boolean }>();

/** Regiões de fundo: header/main/footer de nível mais alto que não contêm o diálogo nem estão dentro dele. */
function backgroundRegions(dialog: HTMLElement): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(LANDMARKS)].filter(
    (el) => !el.contains(dialog) && !dialog.contains(el) && !el.parentElement?.closest(LANDMARKS),
  );
}

function makeInert(regions: HTMLElement[]) {
  regions.forEach((el) => {
    const cur = inertOwners.get(el);
    if (cur) {
      cur.count += 1;
      return;
    }
    const owned = !el.inert;
    if (owned) el.inert = true;
    inertOwners.set(el, { count: 1, owned });
  });
}

function releaseInert(regions: HTMLElement[]) {
  regions.forEach((el) => {
    const cur = inertOwners.get(el);
    if (!cur) return;
    cur.count -= 1;
    if (cur.count > 0) return;
    if (cur.owned) el.inert = false;
    inertOwners.delete(el);
  });
}

/**
 * Enquanto `active` for verdadeiro: mantém o Tab dentro do diálogo e deixa header/main/footer
 * inertes, para que leitores de tela (navegação por gesto) não saiam do diálogo.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const regions = backgroundRegions(ref.current);
    makeInert(regions);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const f = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!ref.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      releaseInert(regions);
    };
  }, [ref, active]);
}
