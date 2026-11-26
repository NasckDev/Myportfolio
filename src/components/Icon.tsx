import type { CSSProperties, ReactNode } from "react";

/** Ícones do design (traço de 1,9 px, 24×24). */
const PATHS: Record<string, ReactNode> = {
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9m5 0h2M4 17h2m5 0h9" />
      <circle cx="15.5" cy="7" r="2.3" />
      <circle cx="8.5" cy="17" r="2.3" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  download: <path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  home: <path d="M4 11.5 12 4.5l8 7V20h-5.5v-5.5h-5V20H4z" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  code: <path d="m8 8-4 4 4 4m8-8 4 4-4 4M13.5 5.5l-3 13" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20.5c.6-3.6 3.7-5.5 7.5-5.5s6.9 1.9 7.5 5.5" />
    </>
  ),
  alert: <path d="M12 8v5m0 3.5v.1M4 19 12 4.5 20 19z" />,
  inbox: <path d="M4 13.5 6.5 5.5h11L20 13.5V19H4zM4 13.5h4.5l1 2.5h5l1-2.5H20" />,
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M9 7.5v-2A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v2M3.5 12.5h17" />
    </>
  ),
  menu: <path d="M5 7h14M5 12h14M5 17h14" />,
  list: <path d="M9 7h11M9 12h11M9 17h11M4.5 7h.1M4.5 12h.1M4.5 17h.1" />,
  contrast: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16a8 8 0 0 0 0-16z" fill="currentColor" />
    </>
  ),
  layers: <path d="m12 4 8 4.5-8 4.5-8-4.5zM4 12.5l8 4.5 8-4.5M4 16.5 12 21l8-4.5" />,
  pen: <path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19zM14 6.5l3.5 3.5" />,
  game: (
    <>
      <rect x="3" y="8" width="18" height="10" rx="5" />
      <path d="M8 11.5v3M6.5 13h3M15.5 12.5h.1M17.5 14h.1" />
    </>
  ),
  pause: <path d="M9 6v12M15 6v12" />,
  play: <path d="M8.5 5.5v13l10-6.5z" />,
};

export function Icon({ name, style, className }: { name: string; style?: CSSProperties; className?: string }) {
  return (
    <svg className={className ? `i ${className}` : "i"} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={style}>
      {PATHS[name] ?? null}
    </svg>
  );
}

/** Logo "n + cursor". */
export function Logo({ className = "logo" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect className="lg-bg" width="40" height="40" rx="11" />
      <path className="lg-n" d="M10 30.25V18.75a6.25 6.25 0 0 1 12.5 0v11.5" />
      <rect className="lg-c" x="27.5" y="24.25" width="6" height="6" rx="1" />
    </svg>
  );
}
