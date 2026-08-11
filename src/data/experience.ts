export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  company: string;
  description: string;
  bullets: string[];
  technologies: string[];
}

export const experiences: ExperienceItem[] = [
  {
    id: "mindminers",
    period: "AGO 2025 — ATUAL",
    role: "Software Engineer Front-End Pleno",
    company: "MindMiners",
    description: "Produto, interfaces orientadas a dados e evolução de Design System.",
    bullets: [
      "Transformação de fluxos do Figma em componentes acessíveis e reutilizáveis.",
      "Construção de filtros, formulários, modais, painéis redimensionáveis, insights e tooltips.",
      "Integrações REST e recursos de IA com tratamento de estados assíncronos.",
      "Feature flags, eventos de produto, acessibilidade e colaboração com Produto, Design, Dados e Backend.",
    ],
    technologies: ["React", "TypeScript", "SCSS", "REST", "Figma", "C#", "Python"],
  },
  {
    id: "ey-pleno",
    period: "JUL 2023 — AGO 2025",
    role: "Frontend & Microsservices Pleno",
    company: "EY",
    description: "Aplicações corporativas e microsserviços em um ecossistema de entrega contínua.",
    bullets: [
      "Evolução de produtos com AngularJS, Vue, Nuxt, TypeScript e JavaScript.",
      "Manutenção de serviços Node.js e NestJS integrados por APIs REST.",
      "Testes com Jest e atuação em pipelines com Jenkins e ArgoCD.",
      "Fluxo colaborativo usando GitHub, GitLab e Azure DevOps.",
      "Atuação em projeto para a Vivo dentro da EY.",
    ],
    technologies: ["AngularJS", "Vue", "Nuxt", "Node.js", "NestJS", "Jest"],
  },
  {
    id: "ey-junior",
    period: "AGO 2022 — AGO 2023",
    role: "Frontend / SAP Commerce Junior",
    company: "EY",
    description: "Experiências de e-commerce com evolução incremental e entregas seguras.",
    bullets: [
      "Desenvolvimento front-end no ecossistema SAP Commerce.",
      "Integrações JavaScript e REST com foco em experiência do usuário.",
      "Uso de feature flags, internacionalização e acompanhamento de deploys.",
    ],
    technologies: ["SAP Commerce", "JavaScript", "REST", "i18n", "Feature flags"],
  },
  {
    id: "ey-trainee",
    period: "FEV 2021 — AGO 2022",
    role: "Trainee SAP Sales / Commerce",
    company: "EY",
    description: "Início da carreira em soluções empresariais e processos comerciais.",
    bullets: [
      "Desenvolvimento e manutenção de soluções SAP para fluxos comerciais.",
      "Contato com C#, ABSL e integrações em ambiente corporativo.",
    ],
    technologies: ["SAP", "C#", "ABSL"],
  },
  {
    id: "partners",
    period: "AGO 2020 — FEV 2021",
    role: "Estagiário de Desenvolvimento",
    company: "Partners Digital",
    description: "Primeira experiência profissional construindo soluções digitais.",
    bullets: [
      "Apoio no desenvolvimento e manutenção de aplicações web.",
      "Fundamentos de entrega, colaboração e resolução de problemas reais.",
    ],
    technologies: ["Web", "JavaScript", "Git"],
  },
];
