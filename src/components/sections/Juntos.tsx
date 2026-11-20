import type { ComponentType } from "react";
import { juntos, type JuntosHighlightIcon, type JuntosProject } from "@/data/portfolio";
import { Reveal, Scramble } from "@/components/motion/Reveal";
import { ArrowUpRightIcon, GithubIcon, RepeatIcon, SheetIcon, TrendingUpIcon, UsersIcon } from "@/components/ui/icons";

/**
 * Paleta do próprio app (docs/06-design.md do Juntos): o índigo de destaque e o painel escuro do resumo do mês.
 * Contrastes sobre HERO: INK 16,2:1, MUTE 9,2:1, BRAND_LIGHT 7,9:1; texto branco sobre BRAND 6,2:1.
 */
const HERO = "#19182f"; // hsl(243 32% 14%), o --hero do app
const HERO_LINE = "#34324f";
const BRAND = "#5048e5"; // hsl(243 75% 59%), o --brand do app
const BRAND_LIGHT = "#aaa6fb"; // hsl(243 90% 82%), o --brand-text do tema escuro
const INK = "#f7f7fa";
const MUTE = "#bdbbd2";

const HIGHLIGHT_ICONS: Record<JuntosHighlightIcon, ComponentType<{ size?: number; sw?: number }>> = {
  repeat: RepeatIcon,
  split: UsersIcon,
  plan: TrendingUpIcon,
  sheet: SheetIcon,
};

const ctaBase =
  "flex h-[52px] items-center gap-2.5 rounded-full px-6 text-[15.5px] font-semibold no-underline focus-visible:outline-[#c9c6ff]";
const newTab = <span className="sr-only"> (abre em nova aba)</span>;

/** Marca do Juntos: dois anéis entrelaçados no quadrado índigo, como no app. */
function JuntosMark() {
  return (
    <svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill={BRAND} />
      <g fill="none" stroke="#fff" strokeWidth="3.2">
        <circle cx="16" cy="20" r="6.5" />
        <circle cx="24" cy="20" r="6.5" />
      </g>
    </svg>
  );
}

/** Computador e celular sobrepostos, com os prints reais do app. */
function DeviceShowcase({ shots }: { shots: JuntosProject["shots"] }) {
  const { desktop, phone } = shots;
  return (
    <div className="relative pb-[14%] pr-[5%]">
      <Reveal
        as="div"
        className="overflow-hidden rounded-[14px] sm:rounded-[18px]"
        style={{ background: "#0f0e1f", boxShadow: `0 0 0 1px ${HERO_LINE}, 0 40px 80px -36px rgba(0,0,0,.8)` }}
      >
        <div className="flex h-7 items-center gap-1.5 px-3.5 sm:h-8" aria-hidden="true">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="size-2.5 rounded-full" style={{ background: c, opacity: 0.85 }} />
          ))}
        </div>
        <img
          src={desktop.src}
          alt={desktop.alt}
          width={1440}
          height={900}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 680px, 92vw"
          className="block h-auto w-full"
        />
      </Reveal>
      <Reveal
        as="div"
        delay={160}
        className="absolute bottom-0 right-0 w-[30%] max-w-[220px] overflow-hidden rounded-[22px] sm:rounded-[28px]"
        style={{ background: "#0f0e1f", padding: "5px", boxShadow: `0 0 0 1px ${HERO_LINE}, 0 30px 60px -20px rgba(0,0,0,.85)` }}
      >
        <img
          src={phone.src}
          alt={phone.alt}
          width={780}
          height={1688}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 220px, 30vw"
          className="block h-auto w-full rounded-[17px] sm:rounded-[23px]"
        />
      </Reveal>
    </div>
  );
}

type Props = { project?: JuntosProject };

/** "Juntos": seção própria do app de finanças da casa, com a identidade visual do app. */
export function Juntos({ project = juntos }: Props) {
  return (
    <section id="juntos" aria-labelledby="juntos-titulo" className="container-x section-pad scroll-mt-20">
      <Reveal
        className="relative isolate overflow-hidden rounded-[30px] border"
        style={{ background: HERO, borderColor: HERO_LINE, boxShadow: "0 40px 80px -40px rgba(25,24,47,.7)" }}
      >
        {/* Pontilhado e brilho índigo, como a arte da tela de entrada do app. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `radial-gradient(circle at 82% 8%, rgba(80,72,229,.42), transparent 42%), radial-gradient(rgba(170,166,251,.13) 1px, transparent 1px)`,
            backgroundSize: "auto, 22px 22px",
          }}
        />

        <div className="grid items-center gap-12 px-5 py-9 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14 lg:px-14 lg:pt-16 lg:pb-14">
          <div className="flex min-w-0 flex-col gap-5">
            <Scramble text={project.label} className="mono text-[13px] font-semibold" style={{ color: BRAND_LIGHT }} />
            <div className="flex items-center gap-3.5">
              <JuntosMark />
              <h2
                id="juntos-titulo"
                className="stretch-120 font-bold"
                style={{ color: INK, fontSize: "clamp(38px,5vw,62px)", lineHeight: 1.02, letterSpacing: "-.025em" }}
              >
                {project.name}
              </h2>
            </div>
            <p className="text-[20px] font-semibold leading-[1.35]" style={{ color: INK }}>
              {project.tagline}
            </p>
            <p className="max-w-[56ch] text-[16.5px] leading-[1.6]" style={{ color: MUTE }}>
              {project.problem}
            </p>

            <ul className="flex flex-wrap gap-1.5" aria-label="Feito com">
              {project.stack.map((t) => (
                <li
                  key={t}
                  className="mono rounded-full px-2.5 py-[5px] text-[12.5px] font-medium leading-normal"
                  style={{ background: "rgba(247,247,250,.07)", color: INK, boxShadow: "inset 0 0 0 1px rgba(247,247,250,.16)" }}
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              {project.appUrl ? (
                <a
                  href={project.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic="1"
                  className={ctaBase}
                  style={{ background: BRAND, color: "#fff", transition: "transform .35s cubic-bezier(.2,.8,.2,1)" }}
                >
                  Abrir o app
                  <ArrowUpRightIcon size={17} sw={2.4} />
                  {newTab}
                </a>
              ) : null}
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaBase}
                style={
                  project.appUrl
                    ? { color: INK, boxShadow: "inset 0 0 0 1.5px rgba(247,247,250,.42)" }
                    : { background: BRAND, color: "#fff" }
                }
              >
                <GithubIcon size={18} sw={2} />
                Ver o código no GitHub
                {newTab}
              </a>
            </div>
          </div>

          <DeviceShowcase shots={project.shots} />
        </div>

        {/* Faixa de destaques, de ponta a ponta, embaixo do texto e dos aparelhos. */}
        <ul
          className="grid gap-x-8 gap-y-5 border-t px-5 py-8 sm:grid-cols-2 sm:gap-y-7 sm:px-10 lg:grid-cols-4 lg:px-14 lg:py-10"
          style={{ borderColor: HERO_LINE }}
          aria-label="Destaques"
        >
          {project.highlights.map(({ icon, title, text }) => {
            const Icon = HIGHLIGHT_ICONS[icon];
            return (
              <li key={title} className="flex gap-3.5 lg:flex-col lg:gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: "rgba(80,72,229,.22)", color: BRAND_LIGHT, boxShadow: "inset 0 0 0 1px rgba(170,166,251,.22)" }}
                >
                  <Icon size={20} sw={2} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <strong className="text-[16.5px] font-semibold leading-[1.35]" style={{ color: INK }}>
                    {title}
                  </strong>
                  <span className="text-[15px] leading-[1.55]" style={{ color: MUTE }}>
                    {text}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
