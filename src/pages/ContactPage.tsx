import { useId, useRef, useState } from "react";
import { Arrow } from "@/components/Blocks";
import { Icon } from "@/components/Icon";
import { EMAIL, FACTS, LINKS, MODES } from "@/data/site";
import { useReveal } from "@/hooks/useReveal";
import {
  CONTACT_LIMITS,
  contactMessage,
  contactSubject,
  isEmail,
  mailtoHref,
  MODE_OPTIONS,
  ROLE_OPTIONS,
  sendCooldown,
  sendViaFormSubmit,
  validateContact,
  type ContactField,
  type ContactInput,
} from "@/lib/contact";
import { readStorage, writeStorage } from "@/lib/storage";
import { ExtLink, Link } from "@/router/Link";
import { useUi } from "@/shell/ui";
import "@/styles/contact.css";

type Status = { text: string; kind: "ok" | "warn" | "info" } | null;

const SENDS_KEY = "nasck-contact-sends";

function readSends(): number[] {
  try {
    const v: unknown = JSON.parse(readStorage(SENDS_KEY, "session") ?? "[]");
    return Array.isArray(v) ? v.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
}

const FALLBACK = "use “Abrir no meu e-mail” ou “Copiar”";

function Choice({ name, legend, options, value, onChange, other, onOther, otherLabel, otherPlaceholder }: {
  name: string;
  legend: string;
  options: readonly (readonly [string, string])[];
  value: string;
  onChange: (v: string) => void;
  other: string;
  onOther: (v: string) => void;
  otherLabel: string;
  otherPlaceholder: string;
}) {
  const isOther = value === "outra" || value === "outro";
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="opt">
        {options.map(([v, l]) => (
          <label key={v}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
            <span>{l}</span>
          </label>
        ))}
      </div>
      {isOther ? (
        <label className="field other">
          {otherLabel}
          <input type="text" placeholder={otherPlaceholder} value={other} onChange={(e) => onOther(e.target.value)} />
        </label>
      ) : null}
    </fieldset>
  );
}

export function Composer() {
  const { copy } = useUi();
  const [input, setInput] = useState<ContactInput>({
    name: "",
    email: "",
    company: "",
    role: ROLE_OPTIONS[0]![0],
    roleOther: "",
    mode: MODE_OPTIONS[0]![0],
    modeOther: "",
  });
  const [custom, setCustom] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const [invalid, setInvalid] = useState<readonly ContactField[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const mailRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const hpId = useId();

  const set = <K extends keyof ContactInput>(k: K, v: ContactInput[K]) => {
    setInput((cur) => ({ ...cur, [k]: v }));
    setInvalid((cur) => cur.filter((f) => f !== k));
  };
  const generated = contactMessage(input);
  const message = custom ?? generated;
  const subject = contactSubject(input);

  const fieldRefs = { name: nameRef, email: mailRef, company: companyRef, message: msgRef };
  const isInvalid = (f: ContactField) => (invalid.includes(f) ? true : undefined);

  const send = async () => {
    if (sending) return;
    if (honeypot) {
      setStatus({ text: "Mensagem enviada.", kind: "ok" });
      return;
    }
    const problems = validateContact({ ...input, message });
    setInvalid(problems.map((p) => p.field));
    const first = problems[0];
    if (first) {
      fieldRefs[first.field].current?.focus();
      setStatus({ text: first.text, kind: "warn" });
      return;
    }
    const sends = readSends();
    const wait = sendCooldown(sends, Date.now());
    if (wait > 0) {
      setStatus({
        text: Number.isFinite(wait)
          ? `Você acabou de enviar uma mensagem. Aguarde ${Math.ceil(wait / 1000)} s para enviar outra ou ${FALLBACK}.`
          : `Limite de envios desta sessão atingido. Para mandar outra mensagem, ${FALLBACK}.`,
        kind: "warn",
      });
      return;
    }
    setSending(true);
    setStatus({ text: "Enviando…", kind: "info" });
    const result = await sendViaFormSubmit(EMAIL, { name: input.name, email: input.email, company: input.company, subject, message });
    setSending(false);
    if (result !== "failed") writeStorage(SENDS_KEY, JSON.stringify([...sends, Date.now()]), "session");
    setStatus(
      result === "ok"
        ? { text: "Mensagem enviada. A resposta chega no e-mail informado.", kind: "ok" }
        : result === "activation"
          ? { text: `A mensagem foi recebida, mas o envio automático ainda está sendo ativado. Para garantir a entrega, ${FALLBACK}.`, kind: "warn" }
          : { text: `Não foi possível enviar agora. Tente de novo em instantes ou ${FALLBACK}.`, kind: "warn" },
    );
  };

  return (
    <form
      className="sheet composer"
      aria-labelledby="cp-t"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <h2 className="h2" id="cp-t">
        Envie uma mensagem
      </h2>
      <div className="two">
        <label className="field">
          Seu nome
          <input
            ref={nameRef}
            type="text"
            autoComplete="name"
            placeholder="Nome completo"
            maxLength={CONTACT_LIMITS.name}
            value={input.name}
            aria-invalid={isInvalid("name")}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>
        <label className="field">
          Seu e-mail
          <input
            ref={mailRef}
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            maxLength={CONTACT_LIMITS.email}
            value={input.email}
            aria-invalid={isInvalid("email") ?? (input.email !== "" && !isEmail(input.email) ? true : undefined)}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>
      </div>
      <label className="field">
        Sua empresa
        <input
          ref={companyRef}
          type="text"
          autoComplete="organization"
          placeholder="Nome da empresa"
          maxLength={CONTACT_LIMITS.company}
          value={input.company}
          aria-invalid={isInvalid("company")}
          onChange={(e) => set("company", e.target.value)}
        />
      </label>
      <Choice
        name="cvaga"
        legend="Vaga"
        options={ROLE_OPTIONS}
        value={input.role}
        onChange={(v) => set("role", v)}
        other={input.roleOther}
        onOther={(v) => set("roleOther", v)}
        otherLabel="Qual vaga?"
        otherPlaceholder="Ex.: staff engineer"
      />
      <Choice
        name="cmodo"
        legend="Modelo"
        options={MODE_OPTIONS}
        value={input.mode}
        onChange={(v) => set("mode", v)}
        other={input.modeOther}
        onOther={(v) => set("modeOther", v)}
        otherLabel="Qual modelo?"
        otherPlaceholder="Ex.: presencial em Campinas"
      />
      <label className="field">
        Mensagem
        <textarea ref={msgRef} rows={8} maxLength={CONTACT_LIMITS.message} value={message} aria-invalid={isInvalid("message")} onChange={(e) => {
            setCustom(e.target.value);
            setInvalid((cur) => cur.filter((f) => f !== "message"));
          }}
        />
      </label>
      <div className="msg-foot">
        <span className="small muted">O texto é gerado a partir das opções acima e pode ser editado.</span>
        {custom !== null ? (
          <button
            type="button"
            className="btn btn-line small-btn"
            onClick={() => {
              setCustom(null);
              msgRef.current?.focus();
            }}
          >
            Refazer o texto
          </button>
        ) : null}
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor={hpId}>Não preencha este campo</label>
        <input id={hpId} type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <div className="links">
        <button type="submit" className="btn btn-ink" disabled={sending} aria-describedby="cp-auto">
          {sending ? "Enviando…" : "Enviar mensagem"}
          <Arrow />
        </button>
        <a className="btn btn-line" href={mailtoHref(EMAIL, subject, message)}>
          <Icon name="mail" />
          Abrir no meu e-mail
        </a>
        <button type="button" className="btn btn-line" onClick={() => copy(message, "Mensagem copiada")}>
          <Icon name="copy" />
          Copiar
        </button>
      </div>
      <p className="small muted" id="cp-auto">
        “Enviar mensagem” manda o texto direto para o meu e-mail, sem abrir o seu programa de e-mail.
      </p>
      {status ? (
        <p className="notice" role="status" data-k={status.kind}>
          {status.text}
        </p>
      ) : (
        <p className="sr" role="status" />
      )}
    </form>
  );
}

export default function ContactPage() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const { copyEmail } = useUi();
  return (
    <div className="stack" ref={ref}>
      <div className="sheet">
        <div className="view-head" style={{ paddingBottom: 0 }}>
          <h1 className="display">Contato</h1>
          <p className="lead muted">
            Aberto a avaliar novas oportunidades sênior de engenharia de software, front-end ou full stack. Abaixo estão as informações essenciais e os canais de contato.
          </p>
        </div>
        <dl className="facts" data-sec="Resumo">
          {FACTS.map(([a, b]) => (
            <div className="fact" key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
        <div className="links" style={{ marginTop: 18 }}>
          <ExtLink className="btn btn-ink" href={LINKS.cv}>
            <Icon name="download" />
            Currículo em PDF
          </ExtLink>
          <ExtLink className="btn btn-line" href={LINKS.cvAts}>
            Currículo para ATS
          </ExtLink>
          <Link className="btn btn-line" to="/projetos">
            Ver projetos
          </Link>
          <Link className="btn btn-line" to="/habilidades">
            Ver habilidades
          </Link>
        </div>
      </div>
      <div className="ct-grid" data-sec="Mensagem">
        <section className="contact on-dark" style={{ margin: 0 }} aria-label="Canais de contato">
          <div>
            <p className="muted" style={{ marginBottom: 10 }}>
              Contato direto
            </p>
            <button type="button" className="mailbtn" onClick={copyEmail} aria-label={`Copiar e-mail ${EMAIL}`}>
              <span className="c">
                <Icon name="copy" />
              </span>
              <span>{EMAIL}</span>
            </button>
          </div>
          <div className="contact-row">
            <a className="btn btn-tile" href={`mailto:${EMAIL}?subject=${encodeURIComponent("Oportunidade front-end")}`}>
              <Icon name="mail" />
              Escrever e-mail
            </a>
            <ExtLink className="btn btn-ghost-tile" href={LINKS.linkedin}>
              LinkedIn
            </ExtLink>
            <ExtLink className="btn btn-ghost-tile" href={LINKS.github}>
              GitHub
            </ExtLink>
            <ExtLink className="btn btn-ghost-tile" href={LINKS.codepen}>
              CodePen
            </ExtLink>
          </div>
          <div>
            <p className="muted" style={{ marginBottom: 10 }}>
              Modelos de trabalho
            </p>
            <div className="modes">
              {MODES.map((m) => (
                <span className="chip" key={m}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>
        <Composer />
      </div>
    </div>
  );
}
