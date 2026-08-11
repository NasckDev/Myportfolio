export interface TechItem {
  name: string;
  category: "Front-end" | "Ecossistema" | "Qualidade" | "Produto";
  level: number;
  levelLabel: string;
  years: number;
  yearsLabel: string;
  experience: string;
  evidence: string;
}

export const techStack: TechItem[] = [
  {
    name: "React",
    category: "Front-end",
    level: 91,
    levelLabel: "Sênior",
    years: 6,
    yearsLabel: "+6 anos",
    experience: "Desde a formação técnica e acadêmica",
    evidence: "Componentização, aplicações orientadas a dados e integração com Design Systems.",
  },
  {
    name: "TypeScript",
    category: "Front-end",
    level: 90,
    levelLabel: "Sênior",
    years: 6,
    yearsLabel: "+6 anos",
    experience: "Formação, EY e MindMiners",
    evidence: "Contratos seguros, componentes escaláveis e integrações com APIs REST.",
  },
  {
    name: "JavaScript",
    category: "Front-end",
    level: 93,
    levelLabel: "Sênior",
    years: 6,
    yearsLabel: "+6 anos",
    experience: "Etec, formação e trajetória profissional",
    evidence: "Experiência contínua em interfaces, e-commerce e aplicações corporativas.",
  },
  {
    name: "Angular / AngularJS",
    category: "Front-end",
    level: 86,
    levelLabel: "Sênior",
    years: 4,
    yearsLabel: "+4 anos",
    experience: "Projetos corporativos na EY",
    evidence: "Produtos corporativos, manutenção evolutiva e integração com microsserviços.",
  },
  {
    name: "Vue / Nuxt",
    category: "Ecossistema",
    level: 81,
    levelLabel: "Pleno",
    years: 3,
    yearsLabel: "+3 anos",
    experience: "Vue e Nuxt na EY",
    evidence: "Construção e evolução de aplicações com Vue, Nuxt e TypeScript.",
  },
  {
    name: "Node / NestJS",
    category: "Ecossistema",
    level: 74,
    levelLabel: "Pleno",
    years: 3,
    yearsLabel: "+3 anos",
    experience: "Microsserviços na EY",
    evidence: "Integrações REST, serviços Node.js e manutenção de microsserviços NestJS.",
  },
  {
    name: "Testes / Jest",
    category: "Qualidade",
    level: 79,
    levelLabel: "Sênior",
    years: 6,
    yearsLabel: "+6 anos",
    experience: "Etec, formação e trajetória profissional",
    evidence: "Testes unitários, integração, revisão de código e pipelines de entrega.",
  },
  {
    name: "A11y / Design Systems",
    category: "Produto",
    level: 89,
    levelLabel: "Pleno",
    years: 3,
    yearsLabel: "+3 anos",
    experience: "EY e MindMiners",
    evidence: "Navegação por teclado, foco, semântica, estados e componentes acessíveis.",
  },
];

export const heroTech = ["React", "Angular", "TypeScript"];
