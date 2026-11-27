import { readStorage, writeStorage } from "@/lib/storage";
import { useEffect, useRef, useState } from "react";
import { ChapHead, SpecCards } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { ALL_SKILLS, SKILLS, skillEvidence, type Evidence } from "@/data/content";
import { useReveal } from "@/hooks/useReveal";
import { scrollBehavior } from "@/lib/motion";
import { Link } from "@/router/Link";
import { useRouter } from "@/router/router";
import "@/styles/skills.css";

const MEMORY_KEY = "nasck-habilidade";
const remembered = (): string => readStorage(MEMORY_KEY, "session") ?? "React";

export function SkillPanel({ skill }: { skill: string }) {
  const { projects, jobs, note } = skillEvidence(skill);
  const row = (e: Evidence) => (
    <li key={e.name + e.href}>
      <Link to={e.href} state={e.job ? { job: e.job } : undefined}>
        <b>{e.name}</b>
        <span className="q">{e.kind}</span>
        <span className="st">{e.job ? "Ver experiência" : "Abrir"}</span>
      </Link>
    </li>
  );
  return (
    <>
      <p className="small muted">Aplicada em</p>
      <h3 className="h2 xname">{skill}</h3>
      {note ? <p className="xnote">{note}</p> : null}
      {projects.length ? (
        <>
          <p className="small muted" style={{ marginTop: 8 }}>
            Projetos
          </p>
          <ul className="repo-list" aria-label={`Projetos com ${skill}`}>
            {projects.map(row)}
          </ul>
        </>
      ) : null}
      {jobs.length ? (
        <>
          <p className="small muted" style={{ marginTop: 8 }}>
            Experiência profissional
          </p>
          <ul className="repo-list" aria-label={`Experiência com ${skill}`}>
            {jobs.map(row)}
          </ul>
        </>
      ) : null}
    </>
  );
}

type MockState = "loading" | "empty" | "error" | "partial" | "success";
const STATES: readonly [MockState, string][] = [
  ["loading", "Carregando"],
  ["empty", "Vazio"],
  ["error", "Erro"],
  ["partial", "Parcial"],
  ["success", "Sucesso"],
];
const BILLS: readonly [string, string, string, string][] = [
  ["14", "Conta de água", "Vence em 3 dias", "R$ 92,30"],
  ["22", "Internet", "Conta da casa", "R$ 119,90"],
  ["28", "Financiamento", "Parcela 5 de 54", "R$ 1.240,00"],
  ["30", "Aluguel", "Conta fixa", "R$ 1.850,00"],
];
const RETRY_MS = 1100;

function Bill({ b }: { b: (typeof BILLS)[number] }) {
  return (
    <li className="row">
      <span className="d">{b[0]}</span>
      <span>
        <b>{b[1]}</b>
        <small>{b[2]}</small>
      </span>
      <span className="v">{b[3]}</span>
    </li>
  );
}

const SkeletonRow = ({ short }: { short?: boolean }) => (
  <li className="row" style={{ animation: "none" }}>
    <span className="d sk" style={{ height: 44 }} />
    {short ? (
      <span className="sk" style={{ width: "50%" }} />
    ) : (
      <span style={{ display: "grid", gap: 8 }}>
        <span className="sk" style={{ width: "60%" }} />
        <span className="sk" style={{ width: "38%", height: 10 }} />
      </span>
    )}
    <span className="sk" style={{ width: 64 }} />
  </li>
);

/** "Cinco estados": o mesmo componente em carregando, vazio, erro, parcial e sucesso. */
export function FiveStates() {
  const [state, setState] = useState<MockState>("success");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const show = (s: MockState) => {
    window.clearTimeout(timer.current);
    setState(s);
  };
  const head = (
    <div className="mock-h">
      <span>Próximos vencimentos</span>
      <code>state: {state}</code>
    </div>
  );
  let body;
  if (state === "loading")
    body = (
      <ul className="rows" aria-label="Carregando vencimentos" aria-busy="true">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </ul>
    );
  else if (state === "empty")
    body = (
      <div className="mock-msg">
        <span className="ic">
          <Icon name="inbox" />
        </span>
        <b>Nenhuma conta vence nos próximos 7 dias</b>
        <span className="muted small">Cadastre uma conta fixa e ela passa a aparecer aqui todo mês.</span>
        <button type="button" className="btn btn-ink" onClick={() => show("success")}>
          Adicionar conta fixa
        </button>
      </div>
    );
  else if (state === "error")
    body = (
      <div className="mock-msg" role="alert">
        <span className="ic">
          <Icon name="alert" />
        </span>
        <b>Os vencimentos não carregaram</b>
        <span className="muted small">A conexão caiu antes da resposta. Seus dados continuam salvos.</span>
        <button
          type="button"
          className="btn btn-ink"
          onClick={() => {
            show("loading");
            timer.current = window.setTimeout(() => setState("success"), RETRY_MS);
          }}
        >
          Tentar de novo
        </button>
      </div>
    );
  else if (state === "partial")
    body = (
      <>
        <ul className="rows">
          {BILLS.slice(0, 2).map((b) => (
            <Bill b={b} key={b[1]} />
          ))}
        </ul>
        <p className="notice">Mostrando 2 de 4. As contas fixas ainda estão carregando.</p>
        <ul className="rows" aria-label="Carregando o restante">
          <SkeletonRow short />
        </ul>
      </>
    );
  else
    body = (
      <>
        <ul className="rows">
          {BILLS.map((b) => (
            <Bill b={b} key={b[1]} />
          ))}
        </ul>
        <p className="muted small">Dados fictícios, no formato do Juntos.</p>
      </>
    );

  return (
    <div className="states">
      <div style={{ display: "grid", gap: 18 }}>
        <h2 className="h2" id="st-t">
          Cinco estados em toda interface entregue
        </h2>
        <p className="lead muted">
          Carregando, vazio, erro, parcial e sucesso são projetados e testados antes do fluxo principal. Alterne o estado para ver o mesmo componente responder.
        </p>
        <p className="xcontext" data-testid="prova-contexto">
          <b>Onde aplico:</b> na <Link to="/experiencia" state={{ job: "mindminers" }}>MindMiners</Link>, as jornadas com serviços de IA tratam carregamento, validação, erro e feedback; no{" "}
          <Link to="/projeto/insighthub">InsightHub</Link>, toda tela tem carregando, vazio, erro com tentar de novo e resultado parcial. O exemplo usa o formato do{" "}
          <Link to="/projeto/juntos">Juntos</Link>.
        </p>
        <div className="seg" role="group" aria-label="Estado do componente">
          {STATES.map(([k, l]) => (
            <button type="button" key={k} aria-pressed={state === k} onClick={() => show(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mock" aria-live="polite" data-testid="mock" key={state}>
        {head}
        {body}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLElement>(null);
  useReveal(ref);
  const { location } = useRouter();
  const initial = location.nav.skill && ALL_SKILLS.includes(location.nav.skill) ? location.nav.skill : remembered();
  const [skill, setSkill] = useState(initial);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (!location.nav.jump) return;
    const t = window.setTimeout(() => listRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" }), 450);
    return () => window.clearTimeout(t);
  }, [location.nav.jump]);

  const pick = (s: string) => {
    writeStorage(MEMORY_KEY, s, "session");
    setSkill(s);
    setBump((n) => n + 1);
  };

  return (
    <div className="stack" ref={ref}>
      <div className="sheet">
        <div className="view-head" style={{ paddingBottom: 0 }}>
          <h1 className="display">Habilidades</h1>
          <p className="lead muted">
            Cada habilidade está ligada ao trabalho nas empresas e aos projetos em que foi aplicada, de front-end e back-end a ferramentas e IA: LLMs em produto, RAG e MCP. Selecione uma para ver as evidências.
          </p>
        </div>
      </div>
      <section className="chap" data-sec="Áreas" aria-labelledby="ar-t">
        <ChapHead n="01" k="Áreas" titleId="ar-t" title="Áreas de atuação" text="Cinco frentes de entrega. Cada cartão abre onde a habilidade foi aplicada, no trabalho e nos projetos." />
        <div className="chap-body">
          <SpecCards />
        </div>
      </section>
      <section className="chap" data-sec="Todas" aria-labelledby="ex-t" ref={listRef}>
        <ChapHead
          n="02"
          k="Todas"
          titleId="ex-t"
          title="Todas as habilidades"
          text="O número indica em quantos projetos e experiências cada habilidade foi aplicada. Selecione uma para ver a lista."
        />
        <div className="chap-body">
          <div className="sheet">
            <div className="xwrap">
              <div>
                {SKILLS.map(([group, items]) => (
                  <div className="xgroup" key={group} role="group" aria-labelledby={`sg-${group}`}>
                    <h3 id={`sg-${group}`}>{group}</h3>
                    <div className="chips">
                      {items.map(([s, ev]) => (
                        <button type="button" className="xchip" key={s} aria-pressed={s === skill} onClick={() => pick(s)}>
                          {s}
                          <span aria-hidden="true">{ev.length}</span>
                          <i className="sr">, {ev.length} evidências</i>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <aside className={`xpanel on-dark${bump ? " go" : ""}`} aria-live="polite" key={`p-${bump}`} data-testid="xpanel">
                <SkillPanel skill={skill} />
              </aside>
            </div>
          </div>
        </div>
      </section>
      <section className="chap" data-sec="Prova ao vivo" aria-labelledby="st-t">
        <ChapHead n="03" k="Prova ao vivo" />
        <div className="chap-body">
          <div className="sheet">
            <FiveStates />
          </div>
        </div>
      </section>
    </div>
  );
}
