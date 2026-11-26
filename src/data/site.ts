/** Endereço oficial do portfólio. Único lugar a trocar quando houver domínio próprio. */
export const SITE_URL = "https://nasck.vercel.app";

export const EMAIL = "aleh.dnascimento@gmail.com";

export const PERSON = {
  name: "Alexandre Diogo Nascimento",
  fullName: "Alexandre Diogo Lopes Nascimento",
  shortName: "Alexandre Diogo",
  role: "Engenheiro de software",
  city: "São Paulo",
  region: "SP",
} as const;

export const LINKS = {
  linkedin: "https://www.linkedin.com/in/alexandre-diogo-nascimento",
  github: "https://github.com/NasckDev",
  codepen: "https://codepen.io/Alexandre-Diogo",
  cv: `${SITE_URL}/curriculo-alexandre-diogo-nascimento.pdf`,
  cvAts: `${SITE_URL}/curriculo-alexandre-diogo-nascimento-ats.pdf`,
  vespera: `${SITE_URL}/vespera/`,
  vesperaRepo: "https://github.com/NasckDev/vespera",
  vesperaReleases: "https://github.com/NasckDev/vespera/releases",
} as const;

/** Caminho de uma demo publicada dentro do portfólio (pasta public/projetos/<slug>/). */
export const demoUrl = (slug: string): string => `${SITE_URL}/projetos/${slug}/`;

export const PORTRAIT = {
  cutout: "/assets/retrato-recorte.webp",
  cutoutAlt: "Retrato de Alexandre Diogo de braços cruzados, com camisa social preta",
  photo: "/assets/retrato.webp",
  photoAlt: "Alexandre Diogo de braços cruzados, com camisa social preta, diante de um fundo cinza",
} as const;

export const AVAILABILITY = "Disponível para posições sênior, front-end ou full stack";

export const MODES = [
  "100% remoto, para empresas de qualquer lugar do Brasil",
  "Híbrido em São Paulo, capital e região",
  "Híbrido em Campinas ou Jundiaí",
] as const;

export const FACTS: readonly (readonly [string, string])[] = [
  ["Experiência", "6 anos como engenheiro de software"],
  ["Front-end", "React, Next.js, Angular e Vue.js, com TypeScript"],
  ["Back-end", "Node.js, NestJS e PostgreSQL, com experiência em C#"],
  ["Onde estou", "São Paulo, SP"],
  ["Modelo de trabalho", "Remoto ou híbrido em São Paulo, Campinas e Jundiaí"],
  ["Idiomas", "Português nativo, inglês e espanhol intermediários"],
];

export const MARQUEE = [
  "TypeScript", "React", "Next.js", "Angular", "Vue.js", "Node.js", "NestJS", "Design Systems",
  "Acessibilidade", "Storybook", "Playwright", "Vitest", "TanStack Query", "APIs públicas", "PostgreSQL", "C#",
] as const;

const NUMBER_WORDS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];

/** Número por extenso (até dez), para frases como "Sete produtos publicados". */
export function numberWord(n: number, capital = false): string {
  const w = NUMBER_WORDS[n] ?? String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

export const nf = (n: number): string => n.toLocaleString("pt-BR");
