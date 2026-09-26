import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { navItems, sectionIds } from "@/data/portfolio";
import { live, onFrame } from "@/lib/live";
import { BrandMark } from "./BrandMark";
import { DownloadIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon } from "@/components/ui/icons";

const RING = 106.8;

export function Navbar() {
  const { vp, theme, heroReady, palette, caseOpen, toggleTheme, openPalette, openModal, scrollToId } = usePortfolio();
  const [active, setActive] = useState("topo");
  const hdrRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const spin = useRef(0);
  const flags = useRef({ navIn: false, hide: false, py: 0, palette, caseOpen, w: vp.w });
  flags.current.palette = palette;
  flags.current.caseOpen = caseOpen;
  flags.current.w = vp.w;

  const wide = vp.w >= 860;
  const compact = vp.w < 860;
  const searchPill = vp.w >= 1100;
  const showName = vp.w >= 420;
  const showLast = vp.w >= 1100;
  const kbd = vp.mac ? "⌘K" : "Ctrl K";
  const dark = theme === "dark";

  // Seção ativa (scroll spy).
  useEffect(() => {
    const spy = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
    return () => spy.disconnect();
  }, []);

  const moveInd = useCallback(
    (target?: HTMLElement | null) => {
      const ind = indRef.current, dot = dotRef.current;
      if (!ind) return;
      const act = navRef.current?.querySelector<HTMLElement>(`[data-navlink="${active}"]`) ?? null;
      const el = target || act;
      if (!el) ind.style.opacity = "0";
      else {
        ind.style.width = el.offsetWidth + "px";
        ind.style.transform = `translateX(${el.offsetLeft}px)`;
        ind.style.opacity = target && target !== act ? ".7" : "1";
      }
      if (dot) {
        if (act) {
          dot.style.transform = `translateX(${act.offsetLeft + act.offsetWidth / 2}px)`;
          dot.style.opacity = "1";
        } else dot.style.opacity = "0";
      }
    },
    [active],
  );

  useEffect(() => {
    moveInd();
  }, [moveInd, vp.w, wide]);

  // Entrada dos links depois do loader.
  useLayoutEffect(() => {
    const links = navRef.current?.querySelectorAll<HTMLElement>("[data-navlink]");
    if (!links) return;
    if (!heroReady) {
      if (live.motion)
        links.forEach((a) => {
          a.style.opacity = "0";
          a.style.transform = "translateY(-8px)";
        });
      return;
    }
    flags.current.navIn = true;
    const timers: number[] = [];
    links.forEach((a, i) =>
      timers.push(
        window.setTimeout(() => {
          a.style.opacity = "1";
          a.style.transform = "none";
        }, 180 + i * 60),
      ),
    );
    timers.push(window.setTimeout(() => moveInd(), 700));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroReady, wide]);

  useEffect(() => {
    if (heroReady) flags.current.navIn = true;
  }, [heroReady]);

  useEffect(
    () =>
      onFrame(() => {
        const f = flags.current;
        const se = document.scrollingElement || document.documentElement;
        const y = live.scrollY, max = se.scrollHeight - innerHeight, motion = live.motion;
        if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING * (1 - (max > 0 ? y / max : 0)));
        if (markRef.current) markRef.current.style.transform = motion ? `rotate(${Math.round(y / 400) * 90 + spin.current}deg)` : "none";
        const dy = y - f.py;
        f.py = y;
        const c = y > 40;
        const nav = innerRef.current, hdr = hdrRef.current;
        if (nav) {
          nav.style.padding = c ? "5px 5px 5px 8px" : "8px 8px 8px 12px";
          nav.style.boxShadow = c ? "0 10px 40px -12px rgba(4,20,40,.35)" : "var(--shadow)";
        }
        if (hdr) {
          if (Math.abs(dy) > 2) f.hide = dy > 0 && y > 480;
          const focusIn = hdr.contains(document.activeElement);
          const hide = !f.navIn || (motion && f.hide && !focusIn && !f.palette && f.caseOpen < 0);
          hdr.style.top = c ? "8px" : "14px";
          hdr.style.width = c && f.w >= 1100 ? "min(1080px,calc(100% - 24px))" : "min(1180px,calc(100% - 24px))";
          hdr.style.transform = `translateX(-50%) translateY(${hide ? "-160%" : "0"})`;
          hdr.style.opacity = !f.navIn ? "0" : "1";
        }
      }),
    [],
  );

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <header
      ref={hdrRef}
      className="fixed left-1/2 top-[14px] z-[60] w-[min(1180px,calc(100%-24px))]"
      style={{ transform: "translateX(-50%) translateY(-160%)", opacity: 0, transition: "top .4s cubic-bezier(.2,.8,.2,1),transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s,width .6s cubic-bezier(.2,.8,.2,1)" }}
    >
      <div
        ref={innerRef}
        className="glass-blur flex items-center gap-3 rounded-full border border-line bg-glass"
        style={{ padding: "8px 8px 8px 12px", boxShadow: "var(--shadow)", transition: "padding .4s cubic-bezier(.2,.8,.2,1),box-shadow .4s,background .4s" }}
      >
        <a
          href="#topo"
          onClick={go("topo")}
          onPointerEnter={() => {
            if (live.motion) spin.current += 90;
          }}
          aria-label="Alexandre Nascimento, início"
          className="mr-auto flex shrink-0 items-center gap-2.5 text-head no-underline hover:text-head"
        >
          <span className="relative grid size-[38px] shrink-0 place-items-center">
            <svg width="38" height="38" viewBox="0 0 38 38" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="19" cy="19" r="17" fill="none" stroke="var(--line)" strokeWidth="2" />
              <circle ref={ringRef} cx="19" cy="19" r="17" fill="none" stroke="#1783C1" strokeWidth="2" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} />
            </svg>
            <BrandMark ref={markRef} style={{ transition: "transform .6s cubic-bezier(.2,.8,.2,1)" }} />
          </span>
          {showName && (
            <span className="flex items-baseline gap-1.5 whitespace-nowrap text-[15px] leading-none">
              <span className="stretch-118 font-bold">Alexandre</span>
              {showLast && <span className="font-normal text-muted">Nascimento</span>}
            </span>
          )}
        </a>

        {wide && (
          <nav ref={navRef} aria-label="Principal" onPointerLeave={() => moveInd()} className="relative flex items-center gap-0.5">
            <span
              ref={indRef}
              className="pointer-events-none absolute left-0 top-0 h-full w-0 rounded-full bg-chip opacity-0"
              style={{ boxShadow: "inset 0 0 0 1px var(--line)", transition: "transform .5s cubic-bezier(.34,1.4,.64,1),width .5s cubic-bezier(.34,1.4,.64,1),opacity .25s" }}
            />
            <span
              ref={dotRef}
              className="pointer-events-none absolute bottom-[3px] left-0 z-[2] -ml-[2.5px] size-[5px] rounded-full opacity-0"
              style={{ background: "#1783C1", boxShadow: "0 0 10px rgba(23,131,193,.8)", transition: "transform .55s cubic-bezier(.34,1.56,.64,1),opacity .25s" }}
            />
            {navItems.map(([id, label]) => {
              const cur = active === id;
              return (
                <a
                  key={id}
                  href={"#" + id}
                  data-navlink={id}
                  onClick={go(id)}
                  onPointerEnter={(e) => moveInd(e.currentTarget)}
                  aria-current={cur ? "true" : undefined}
                  className="relative z-[1] whitespace-nowrap rounded-full text-[14.5px] no-underline"
                  style={{
                    color: cur ? "var(--head)" : "var(--text)",
                    fontWeight: cur ? 600 : 500,
                    padding: searchPill ? "10px 16px" : "10px 12px",
                    transition: "color .25s,opacity .4s,transform .5s cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  {label}
                </a>
              );
            })}
          </nav>
        )}

        {searchPill ? (
          <button
            type="button"
            onClick={openPalette}
            aria-label="Abrir busca e comandos"
            className="flex h-[42px] shrink-0 cursor-pointer items-center gap-2.5 rounded-full border border-line bg-bg2 pl-3.5 pr-2.5 text-[14px] font-medium text-muted transition-[border-color] duration-200 hover:border-accent"
          >
            <SearchIcon size={16} />
            {showLast && <span>Buscar</span>}
            <span className="mono rounded-md border border-line bg-surface px-[7px] py-[3px] text-[12px] font-medium leading-normal">{kbd}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openPalette}
            aria-label={compact ? "Abrir menu" : "Abrir busca e comandos"}
            className="grid size-[42px] shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-bg2 text-head hover:border-accent"
          >
            {compact ? <MenuIcon size={18} sw={2.2} /> : <SearchIcon size={17} sw={2.2} />}
          </button>
        )}

        <button
          type="button"
          onClick={(e) => toggleTheme(e.currentTarget)}
          aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
          className="grid size-[42px] shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-bg2 text-head hover:border-accent"
        >
          {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        <a
          href="#"
          data-magnetic="1"
          onClick={(e) => {
            e.preventDefault();
            openModal("cv");
          }}
          className="flex h-[42px] shrink-0 items-center gap-2 rounded-full bg-btn px-[18px] text-[14.5px] font-semibold text-btn-text no-underline hover:bg-brand hover:text-white"
          style={{ transition: "transform .35s cubic-bezier(.2,.8,.2,1),background .2s" }}
        >
          CV
          <DownloadIcon size={15} sw={2.2} />
        </a>
      </div>
    </header>
  );
}
