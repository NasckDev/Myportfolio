import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Arrow, ChapHead, DesignTeaser, Feats, SpecCards } from "@/components/Blocks";
import { CodeBlock } from "@/components/Code";
import { Cover } from "@/components/Cover";
import { Icon } from "@/components/Icon";
import { CompanyMarks } from "@/components/JobDetail";
import { mediaOf } from "@/data/media";
import { CODE_METRICS, GAME, JOBS, MAIN_STACK, PRODUCT_WORD, REPOS } from "@/data/content";
import { getProject, projectPath } from "@/data/projects";
import { AVAILABILITY, LINKS, MARQUEE, nf, PORTRAIT } from "@/data/site";
import { FISCOTRACK_CODE } from "@/data/snippets";
import { TEST_COUNTS, TOTAL_E2E, TOTAL_UNIT } from "@/data/testCounts";
import { useReveal } from "@/hooks/useReveal";
import { ExtLink, Link } from "@/router/Link";
import { HeroName } from "./home/HeroName";
import { Spot } from "./home/Spot";
import "@/styles/home.css";
import "@/styles/code.css";

function SaoPauloTime() {
  const fmt = () => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setT(fmt()), 20_000);
    return () => window.clearInterval(id);
  }, []);
  return <span>{t}</span>;
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  return (
    <section className="sheet hero" aria-labelledby="hero-name" ref={heroRef}>
      <div className="hero-top">
        <span className="avail">{AVAILABILITY}</span>
        <span className="muted">
          São Paulo, <SaoPauloTime />
        </span>
      </div>
      <HeroName heroRef={heroRef} />
      <div className="hero-grid">
        <div className="hero-intro">
          <p className="hero-role">Engenheiro de software. Produtos web completos, da interface ao banco de dados.</p>
          <div className="low">
            <p className="muted" style={{ maxWidth: "52ch" }}>
              Seis anos entregando software em produção: front-end com React e TypeScript, back-end com Node.js e NestJS e experiência com C#. {PRODUCT_WORD} produtos autorais publicados, com código aberto e demonstração ao vivo.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-ink" to="/projetos">
                Ver projetos
                <Arrow />
              </Link>
              <Link className="btn btn-accent" to="/contato">
                Entrar em contato
              </Link>
              <ExtLink className="btn btn-line" href={LINKS.github}>
                <Icon name="code" />
                GitHub
              </ExtLink>
              <ExtLink className="btn btn-line" href={LINKS.cv}>
                <Icon name="download" />
                Currículo
              </ExtLink>
            </div>
          </div>
        </div>
        <div className="portrait">
          <div className="portrait-word" aria-hidden="true">
            <span>nasck</span>
          </div>
          <div className="portrait-clip">
            <img src={PORTRAIT.cutout} alt={PORTRAIT.cutoutAlt} width={880} height={1100} fetchPriority="high" decoding="async" />
          </div>
          <span className="portrait-tag">São Paulo, Brasil</span>
          <div className="bite">
            <Link to="/experiencia" aria-label="Ver experiência">
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
        <div className="hero-side">
          <div className="tile tile-card">
            <b className="tile-t">
              Stack principal{" "}
              <span className="muted small" style={{ fontWeight: 500, marginLeft: 4 }}>
                selecione para ver onde foi aplicada
              </span>
            </b>
            <div className="chips">
              {MAIN_STACK.map(([label, skill]) => (
                <Link className="chip" to="/habilidades" state={{ skill, jump: true }} key={label}>
                  {label}
                </Link>
              ))}
            </div>
            <Link className="btn btn-ink" to="/habilidades" style={{ marginTop: "auto" }}>
              Ver stack completa
              <Arrow />
            </Link>
          </div>
          <dl className="tile tile-dark where on-dark">
            <dt>Agora</dt>
            <dd>MindMiners, SaaS de pesquisa e inteligência de mercado</dd>
            <dt>Antes</dt>
            <dd>EY, no projeto da Vivo (Telefônica)</dd>
            <dd style={{ margin: "6px 0 0" }}>
              <Link className="more" to="/experiencia">
                Ver experiência completa
              </Link>
            </dd>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Juntos() {
  const j = getProject("juntos")!;
  const media = mediaOf("juntos");
  return (
    <section className="jspot" style={{ "--pc": j.color, "--pf": "#FFFFFF" } as CSSProperties} aria-labelledby="js-t">
      <div className="jspot-tx">
        <span className="tagline">
          <span className="status live">No ar</span>
          <span>Produto full stack em produção: interface, servidor, banco de dados e autenticação</span>
        </span>
        <h3 className="display" id="js-t">
          Juntos
        </h3>
        <p className="lead" style={{ fontWeight: 650 }}>
          {j.pitch} Para uma ou duas pessoas, no celular e no computador.
        </p>
        <Feats items={j.feats} />
        <div className="chips">
          {["Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Drizzle ORM", "Better Auth", `${nf(TEST_COUNTS.juntos.unit)} testes`].map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
        <div className="links">
          <ExtLink className="btn btn-tile" href={j.links[0]![1]}>
            Acessar o app
            <span className="ar" style={{ background: "var(--pc)", color: "#fff" }}>
              <Icon name="arrow" />
            </span>
          </ExtLink>
          <Link className="btn btn-ghost-tile" to={projectPath("juntos")}>
            Ver estudo de caso
          </Link>
          <ExtLink className="btn btn-ghost-tile" href={j.links[1]![1]}>
            Código-fonte
          </ExtLink>
        </div>
      </div>
      <Cover project={j} media={media} decorative className="jspot-cover" />
    </section>
  );
}

export default function HomePage() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const marquee = MARQUEE.map((x) => <span key={x}>{x}</span>);
  return (
    <div className="stack" ref={ref}>
      <Hero />
      <div className="marquee" aria-hidden="true">
        <div className="mq-track">
          {marquee}
          {MARQUEE.map((x) => (
            <span key={`b-${x}`}>{x}</span>
          ))}
        </div>
      </div>

      <section className="chap" data-sec="Experiência" aria-labelledby="ch-xp">
        <ChapHead
          n="01"
          k="Experiência"
          titleId="ch-xp"
          title="Seis anos em times de produto"
          text="Do refinamento com Produto e Design ao acompanhamento em produção: entrega, revisão de código, incidentes e CI/CD."
          href="/experiencia"
          cta="Trajetória completa"
        />
        <div className="chap-body">
          <div className="jobs3">
            {JOBS.slice(0, 3).map((job, k) => (
              <Link className={`jobc${k ? "" : " cur on-dark"}`} to="/experiencia" state={{ job: job.id }} key={job.id}>
                <CompanyMarks marks={job.marks} />
                <span className="jw">
                  {job.when}
                  {k ? null : <span className="chip now">Atual</span>}
                </span>
                <b className="h3">{job.company}</b>
                <span className="muted">{job.role}</span>
                <ul>
                  {job.items.slice(0, 3).map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <span className="chips">
                  {job.tech.slice(0, 5).map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </span>
              </Link>
            ))}
          </div>
          <div className="links" style={{ margin: 0 }}>
            <ExtLink className="btn btn-ink" href={LINKS.cv}>
              <Icon name="download" />
              Currículo em PDF
            </ExtLink>
            <ExtLink className="btn btn-line" href={LINKS.linkedin}>
              LinkedIn
            </ExtLink>
            <Link className="btn btn-line" to="/contato">
              Resumo para recrutadores
            </Link>
          </div>
        </div>
      </section>

      <section className="chap" data-sec="Produtos" aria-labelledby="ch-pr">
        <ChapHead
          n="02"
          k="Produtos"
          titleId="ch-pr"
          title="Produtos publicados, com demonstração ao vivo"
          text={`${PRODUCT_WORD} produtos concebidos, projetados e desenvolvidos de ponta a ponta. Todos estão no ar e usam dados fictícios ou públicos.`}
          href="/projetos"
          cta="Todos os projetos"
        />
        <div className="chap-body">
          <Juntos />
          <Spot />
        </div>
      </section>

      <section className="chap" data-sec="Habilidades" aria-labelledby="ch-hb">
        <ChapHead
          n="03"
          k="Habilidades"
          titleId="ch-hb"
          title="Do front-end ao back-end"
          text="Especialidade em front-end, com atuação full stack quando o projeto exige. Cada área indica onde foi aplicada."
          href="/habilidades"
          cta="Todas as habilidades"
        />
        <div className="chap-body">
          <SpecCards />
        </div>
      </section>

      <section className="chap" data-sec="Código" aria-labelledby="ch-cd">
        <ChapHead
          n="04"
          k="Código"
          titleId="ch-cd"
          title="Código aberto e auditável"
          text="Regras de negócio isoladas da interface, em funções pequenas e testadas. Todos os repositórios são públicos."
          href="/codigo"
          cta="Ver trechos de código"
        />
        <div className="chap-body">
          <div className="codepanel on-dark">
            <div className="codepanel-tx">
              <ExtLink className="gh-url" href={LINKS.github}>
                github.com/
                <wbr />
                NasckDev
              </ExtLink>
              <ul className="nums metrics" aria-label="Qualidade medida nos repositórios">
                {CODE_METRICS.map(([value, suffix, label]) => (
                  <li key={label}>
                    <b>
                      <span className="cnt" data-to={value}>
                        {nf(value)}
                      </span>
                      {suffix}
                    </b>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
              <p className="metrics-note">
                Somados, {nf(TOTAL_UNIT)} testes automatizados e {nf(TOTAL_E2E)} cenários de ponta a ponta em {REPOS.length} repositórios públicos.
              </p>
              <div className="links">
                <ExtLink className="btn btn-accent" href={LINKS.github}>
                  Acessar o GitHub
                  <Arrow />
                </ExtLink>
                <Link className="btn btn-ghost-tile" to="/codigo">
                  Ver trechos de código
                </Link>
              </div>
            </div>
            <div className="code-win">
              <div className="code-bar">
                <span>fiscotrack/packages/engine/src/rules/getRuleSet.ts</span>
              </div>
              <CodeBlock code={FISCOTRACK_CODE} lines label="Trecho do FiscoTrack: getRuleSet.ts" />
            </div>
          </div>
        </div>
      </section>

      <section className="chap" data-sec="Design" aria-labelledby="ch-ds">
        <ChapHead
          n="05"
          k="Design"
          titleId="ch-ds"
          title="Design de interfaces"
          text="Estudos de interface publicados como páginas funcionais, com animação, 3D e áudio."
          href="/design"
          cta="Ver todos os estudos"
        />
        <div className="chap-body">
          <DesignTeaser />
        </div>
      </section>

      <section className="chap" data-sec="Jogo" aria-labelledby="ch-jg">
        <ChapHead
          n="06"
          k="Jogo"
          titleId="ch-jg"
          title="Desenvolvimento de jogos"
          text="Véspera é um RPG de ação 2D em pixel art, desenvolvido em equipe de três pessoas com Godot 4 e C#."
          href="/jogo"
          cta="Ver o projeto"
        />
        <div className="chap-body">
          <Link className="gband" to="/jogo">
            <img src={GAME.image} alt={GAME.bandAlt} loading="lazy" decoding="async" />
            <span className="display">Véspera</span>
            <span className="btn btn-tile">
              Ver o projeto
              <span className="ar" style={{ background: GAME.color, color: "#fff" }}>
                <Icon name="arrow" />
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
