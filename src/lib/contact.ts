/** Gerador do texto do compositor de mensagem (puro, para testar sem interface). */
export interface ContactInput {
  name: string;
  email: string;
  company: string;
  /** Vaga escolhida; "outra" usa `roleOther`. */
  role: string;
  roleOther: string;
  /** Modelo escolhido; "outro" usa `modeOther`. */
  mode: string;
  modeOther: string;
}

export const ROLE_OPTIONS: readonly (readonly [string, string])[] = [
  ["engenharia de software sênior", "Engenharia de software sênior"],
  ["front-end sênior", "Front-end sênior"],
  ["full stack sênior", "Full stack sênior"],
  ["tech lead", "Tech lead"],
  ["outra", "Outra"],
];

export const MODE_OPTIONS: readonly (readonly [string, string])[] = [
  ["remota", "Remoto"],
  ["híbrida em São Paulo", "Híbrido em São Paulo"],
  ["híbrida em Campinas ou Jundiaí", "Híbrido em Campinas ou Jundiaí"],
  ["outro", "Outro"],
];

const pick = (v: string, other: string) => (v === "outra" || v === "outro" ? other.trim() : v);

export function contactSubject(i: ContactInput): string {
  const role = pick(i.role, i.roleOther);
  const company = i.company.trim();
  return `Vaga${role ? ` de ${role}` : ""}${company ? ` na ${company}` : ""}`;
}

export function contactMessage(i: ContactInput): string {
  const company = i.company.trim();
  const role = pick(i.role, i.roleOther);
  const mode = pick(i.mode, i.modeOther);
  const who = [i.name.trim(), i.email.trim()].filter(Boolean);
  return (
    `Olá, Alexandre.\n\n${company ? `Represento a ${company} e temos` : "Temos"} uma oportunidade${role ? ` de ${role}` : ""}${mode ? `, ${mode}` : ""}. ` +
    `Conheci seu portfólio e gostaria de apresentar a vaga.\n\nPodemos agendar uma conversa?${who.length ? `\n\n${who.join("\n")}` : ""}`
  );
}

export const isEmail = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export function mailtoHref(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const CONTACT_LIMITS = { name: 100, email: 254, company: 120, message: 5000 } as const;
export const MESSAGE_MIN = 10;
/** Intervalo mínimo entre envios automáticos na mesma sessão do navegador. */
export const SEND_INTERVAL_MS = 60_000;
export const SEND_SESSION_MAX = 3;
const SEND_TIMEOUT_MS = 12_000;

export type ContactField = "name" | "email" | "company" | "message";

export interface ContactProblem {
  field: ContactField;
  text: string;
}

/** Validação do envio automático, na ordem dos campos do formulário. */
export function validateContact(p: { name: string; email: string; company: string; message: string }): ContactProblem[] {
  const out: ContactProblem[] = [];
  if (p.name.trim().length > CONTACT_LIMITS.name) out.push({ field: "name", text: `O nome pode ter até ${CONTACT_LIMITS.name} caracteres.` });
  if (!isEmail(p.email) || p.email.trim().length > CONTACT_LIMITS.email) out.push({ field: "email", text: "Informe um e-mail válido para a resposta." });
  if (p.company.trim().length > CONTACT_LIMITS.company) out.push({ field: "company", text: `O nome da empresa pode ter até ${CONTACT_LIMITS.company} caracteres.` });
  const msg = p.message.trim().length;
  if (msg < MESSAGE_MIN) out.push({ field: "message", text: "Escreva a mensagem antes de enviar." });
  else if (msg > CONTACT_LIMITS.message) out.push({ field: "message", text: `A mensagem pode ter até ${CONTACT_LIMITS.message} caracteres.` });
  return out;
}

/** Quanto falta (ms) para liberar um novo envio, dado o histórico de envios da sessão. */
export function sendCooldown(history: readonly number[], now: number): number {
  if (history.length >= SEND_SESSION_MAX) return Infinity;
  const last = history.at(-1);
  return last === undefined ? 0 : Math.max(0, last + SEND_INTERVAL_MS - now);
}

export type SendResult = "ok" | "activation" | "failed";

export const formSubmitUrl = (to: string): string => `https://formsubmit.co/ajax/${to}`;

const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim();

/**
 * Envio automático pelo FormSubmit (sem conta nem chave). Enquanto o dono não confirma o e-mail de ativação,
 * o serviço guarda a mensagem e responde sem sucesso: isso vira "activation", nunca um erro técnico.
 */
export async function sendViaFormSubmit(
  to: string,
  p: { name: string; email: string; company: string; subject: string; message: string },
): Promise<SendResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(formSubmitUrl(to), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: oneLine(p.name) || "Não informado",
        email: p.email.trim(),
        company: oneLine(p.company) || "Não informada",
        message: p.message.trim(),
        _subject: `[Portfólio] ${oneLine(p.subject) || "Nova mensagem"}`,
        _replyto: p.email.trim(),
        _template: "table",
        _captcha: "false",
      }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as { success?: unknown; message?: unknown };
    if (res.ok && (data.success === true || data.success === "true")) return "ok";
    return typeof data.message === "string" && /activat/i.test(data.message) ? "activation" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}
