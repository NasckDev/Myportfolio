import type { AnchorHTMLAttributes, MouseEvent, Ref } from "react";
import { useRouter, withBase, type NavState } from "./router";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  state?: NavState;
  ref?: Ref<HTMLAnchorElement>;
}

/** Link interno: muda de rota pela History API; com Ctrl/Cmd/Shift ou botão do meio, abre como link comum. */
export function Link({ to, state, onClick, ref, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return;
    e.preventDefault();
    navigate(to, { state });
  };
  return (
    <a ref={ref} href={withBase(to)} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

/** Link externo, sempre em nova aba. */
export function ExtLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
