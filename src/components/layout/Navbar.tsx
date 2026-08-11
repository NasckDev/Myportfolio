import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Menu, X } from "lucide-react";
import {
  ChevronDown,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Projetos", href: "#projects" },
  { label: "Sobre", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "GitHub Lab", href: "#lab" },
  { label: "Experiência", href: "#experience" },
  { label: "Credenciais", href: "#credentials" },
  { label: "Contato", href: "#contact" },
];

const atsPath = `${import.meta.env.BASE_URL}assets/Alexandre_Diogo_Nascimento_Frontend_React_Angular.pdf`;
const cvLinks = [
  { label: "Currículo ATS", href: atsPath, download: true },
  {
    label: "CV visual",
    href: "https://www.canva.com/design/DAGYVXAvpew/qtCK3mMhuJtAgkvtrpZTTQ/edit",
    download: false,
  },
];

export function Navbar() {
  const [activeSection, setActiveSection] = useState("projects");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 28);

      const footer = document.getElementById("site-footer");
      const isFooterVisible = footer
        ? footer.getBoundingClientRect().top <= window.innerHeight * 0.92
        : false;
      setFooterVisible(isFooterVisible);
      if (isFooterVisible) setMobileOpen(false);

      for (const id of navLinks.map((link) => link.href.slice(1)).reverse()) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 170) {
          setActiveSection(id);
          break;
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openCV = (href: string, download: boolean) => {
    if (download) {
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "Alexandre_Diogo_Nascimento_Frontend.pdf";
      anchor.click();
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const navigateMobile = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setPendingHref(href);
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={footerVisible ? { opacity: 0, y: -96 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className={cn(
        "sticky top-0 z-50 border-b border-transparent px-5 transition-all duration-300 md:px-8",
        footerVisible && "pointer-events-none",
        scrolled && "border-border/70 bg-white/85 shadow-[0_10px_36px_rgba(5,20,60,0.06)] backdrop-blur-xl"
      )}
    >
      <nav
        aria-label="Navegação principal"
        className={cn(
          "mx-auto flex max-w-[1240px] items-center justify-between py-5 transition-all duration-300",
          scrolled && "py-3"
        )}
      >
        <a href="#home" aria-label="Alenasck — início" className="shrink-0">
          <Logo />
        </a>

        <ul className="hidden items-center gap-6 xl:flex">
          {navLinks.map((link) => {
            const active = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "relative block py-2 text-xs font-semibold text-muted-foreground transition hover:text-primary",
                    active && "text-primary"
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden xl:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-11 gap-2 rounded-full px-5 shadow-[0_12px_28px_rgba(7,28,86,0.2)]">
                Download CV
                <ChevronDown className="size-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              {cvLinks.map((cv) => (
                <DropdownMenuItem key={cv.label} onSelect={() => openCV(cv.href, cv.download)}>
                  {cv.download ? <Download className="size-4" /> : <FileText className="size-4" />}
                  {cv.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-primary xl:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence
        onExitComplete={() => {
          if (!pendingHref) return;
          document.getElementById(pendingHref.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", pendingHref);
          setPendingHref(null);
        }}
      >
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="absolute top-[76px] right-5 left-5 overflow-hidden rounded-3xl border border-border bg-white/95 p-3 shadow-2xl backdrop-blur-xl md:right-8 md:left-8 xl:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => navigateMobile(event, link.href)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
            <a
              href={atsPath}
              download
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              <Download className="size-4" /> Currículo ATS
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
