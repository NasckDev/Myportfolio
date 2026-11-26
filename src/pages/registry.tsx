import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import type { Route } from "@/data/routes";

type PageName = Route["name"];
type PageModule = { default: ComponentType };

/** Cada rota é um chunk próprio: o JS inicial carrega só a casca e a página aberta. */
const LOADERS: Record<PageName, () => Promise<PageModule>> = {
  inicio: () => import("./HomePage"),
  projetos: () => import("./ProjectsPage"),
  projeto: () => import("./CasePage"),
  design: () => import("./DesignPage"),
  codigo: () => import("./CodePage"),
  jogo: () => import("./GamePage"),
  habilidades: () => import("./SkillsPage"),
  experiencia: () => import("./ExperiencePage"),
  contato: () => import("./ContactPage"),
  "nao-encontrada": () => import("./NotFoundPage"),
};

const loaded = new Map<PageName, ComponentType>();
const lazies = new Map<PageName, LazyExoticComponent<ComponentType>>();

/** Carrega o código da rota antes da transição, para a nova página entrar já pronta. */
export function preloadRoute(route: Route): Promise<void> {
  const name = route.name;
  if (loaded.has(name)) return Promise.resolve();
  return LOADERS[name]().then((m) => {
    loaded.set(name, m.default);
  });
}

function lazyFor(name: PageName) {
  let c = lazies.get(name);
  if (!c) {
    c = lazy(() =>
      LOADERS[name]().then((m) => {
        loaded.set(name, m.default);
        return m;
      }),
    );
    lazies.set(name, c);
  }
  return c;
}

export function PageView({ route }: { route: Route }) {
  const Ready = loaded.get(route.name);
  if (Ready) return <Ready />;
  const Lazy = lazyFor(route.name);
  return (
    <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
      <Lazy />
    </Suspense>
  );
}
