import { useEffect } from "react";

/** Quantos overlays pedem a trava agora. Só destrava quando o último fechar. */
let lockCount = 0;

function setPageScroll(locked: boolean) {
  const value = locked ? "hidden" : "";
  // `html` também: o iOS Safari ignora overflow aplicado só no body.
  document.documentElement.style.overflow = value;
  document.body.style.overflow = value;
}

/**
 * Trava a rolagem da página enquanto `active` for verdadeiro.
 * Conta referências: com gaveta + modal abertos, fechar um não destrava a página.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    if (lockCount === 1) setPageScroll(true);
    return () => {
      lockCount -= 1;
      if (lockCount === 0) setPageScroll(false);
    };
  }, [active]);
}
