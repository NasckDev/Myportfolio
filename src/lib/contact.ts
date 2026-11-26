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

/** Envia pelo Web3Forms (mesmo padrão já usado no projeto). Só é chamado quando há chave no build. */
export async function sendViaWeb3Forms(key: string, payload: { name: string; email: string; company: string; subject: string; message: string }): Promise<boolean> {
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: key,
        subject: payload.subject,
        from_name: payload.name || "Portfólio · contato",
        name: payload.name,
        email: payload.email,
        company: payload.company,
        message: payload.message,
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return res.ok && data.success === true;
  } catch {
    return false;
  }
}
