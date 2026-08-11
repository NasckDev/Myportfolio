export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  url: string;
}

const projectAssets = `${import.meta.env.BASE_URL}assets/projects-ai`;

export const projects: Project[] = [
  {
    id: "1",
    title: "Mockup Página de Carros",
    subtitle: "Accessibility UI",
    description:
      "Mockup de uma página de carros com foco em acessibilidade, desenvolvido no Figma.",
    image: `${projectAssets}/vroom-accessibility.png`,
    tags: ["Figma", "UI/UX", "A11y"],
    url: "https://www.figma.com/proto/Cg8PlX2oynFOGBEkXpKiEy/Untitled?node-id=0-3",
  },
  {
    id: "2",
    title: "E-Ducate Mobile",
    subtitle: "Social Library App",
    description:
      "Rede social de bibliotecas com localização, comentários e avaliações — versão mobile.",
    image: `${projectAssets}/educate-mobile.png`,
    tags: ["Figma", "Mobile", "UI/UX"],
    url: "https://www.figma.com/proto/pCmHI9p1NGhHnPZb76D082/E-ducate-Mobile",
  },
  {
    id: "3",
    title: "Pulse Login",
    subtitle: "React Application",
    description:
      "Tela de login funcional com validação de usuários, sessões e tratamento de erros.",
    image: `${projectAssets}/pulse-auth.png`,
    tags: ["React", "JavaScript", "Auth"],
    url: "https://github.com/NasckDev/Pulse",
  },
  {
    id: "4",
    title: "FrontEnd Educate",
    subtitle: "Full Auth Flow",
    description:
      "Login e cadastro com integração Google/Facebook e API para registro de usuários.",
    image: `${projectAssets}/educate-auth.png`,
    tags: ["React", "OAuth", "API"],
    url: "https://github.com/AlehNascimento/FrontEndEducate",
  },
  {
    id: "5",
    title: "MachineTech Dashboard",
    subtitle: "Java Swing",
    description:
      "Dashboard de coleta de dados de máquinas com Java Swing e XML.",
    image: `${projectAssets}/machinetech.png`,
    tags: ["Java", "Swing", "Dashboard"],
    url: "https://github.com/AlehNascimento/MachineTech",
  },
  {
    id: "6",
    title: "E-Ducate Desktop",
    subtitle: "Desktop Application",
    description:
      "Versão desktop da rede social de bibliotecas com localização e avaliações.",
    image: `${projectAssets}/educate-desktop.png`,
    tags: ["Figma", "Desktop", "UI/UX"],
    url: "https://www.figma.com/design/P72byXyMLtk9Y8wvgbQqno/Educate-Desktop-version",
  },
];
