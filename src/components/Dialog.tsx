import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  id?: string;
  className?: string;
  label?: string;
  labelledBy?: string;
  children: ReactNode;
  /** Elemento que recebe foco ao abrir (por padrão, o primeiro focável). */
  initialFocus?: React.RefObject<HTMLElement | null>;
}

/**
 * Diálogo modal nativo: showModal() deixa o resto da página inerte (foco preso),
 * Esc fecha e o foco volta para quem abriu. Clique no fundo também fecha.
 */
export function Dialog({ open, onClose, id, className, label, labelledBy, children, initialFocus }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      try {
        d.showModal();
      } catch {
        d.setAttribute("open", "");
      }
      (initialFocus?.current ?? d.querySelector<HTMLElement>("input, button, [href], [tabindex]:not([tabindex='-1'])"))?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, initialFocus]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onNativeClose = () => {
      closeRef.current();
      const el = opener.current as HTMLElement | null;
      if (el && el.isConnected && typeof el.focus === "function") el.focus({ preventScroll: true });
    };
    const onCancel = (e: Event) => {
      e.preventDefault();
      d.close();
    };
    d.addEventListener("close", onNativeClose);
    d.addEventListener("cancel", onCancel);
    return () => {
      d.removeEventListener("close", onNativeClose);
      d.removeEventListener("cancel", onCancel);
    };
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- clique no fundo fecha (atalho de mouse); Esc e o botão Fechar cobrem o teclado
    <dialog
      ref={ref}
      id={id}
      className={className}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          ref.current?.close();
        }
      }}
    >
      {open ? children : null}
    </dialog>
  );
}
