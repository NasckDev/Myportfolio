import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { Preloader } from "@/components/effects/Preloader";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";

const Footer = lazy(() => import("@/components/layout/Footer").then((module) => ({ default: module.Footer })));
const Projects = lazy(() => import("@/components/sections/Projects").then((module) => ({ default: module.Projects })));
const About = lazy(() => import("@/components/sections/About").then((module) => ({ default: module.About })));
const Stack = lazy(() => import("@/components/sections/Stack").then((module) => ({ default: module.Stack })));
const GitHubLab = lazy(() => import("@/components/sections/GitHubLab").then((module) => ({ default: module.GitHubLab })));
const Experience = lazy(() => import("@/components/sections/Experience").then((module) => ({ default: module.Experience })));
const Credentials = lazy(() => import("@/components/sections/Credentials").then((module) => ({ default: module.Credentials })));
const Contact = lazy(() => import("@/components/sections/Contact").then((module) => ({ default: module.Contact })));
const VercelInsights = lazy(() => import("@/components/effects/VercelInsights").then((module) => ({ default: module.VercelInsights })));

const productionAnalyticsEnabled =
  import.meta.env.PROD && import.meta.env.VITE_ENABLE_PROD_ANALYTICS === "true";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 }} />
      <Preloader />
      <ScrollProgress />
      <div className="site-shell min-h-screen overflow-x-clip">
        <Navbar />
        <main>
          <Hero />
          <Suspense fallback={<div className="min-h-[40vh] bg-white" aria-label="Carregando conteúdo" />}>
            <Projects />
            <About />
            <Stack />
            <GitHubLab />
            <Experience />
            <Credentials />
            <Contact />
          </Suspense>
        </main>
        <Suspense fallback={null}><Footer /></Suspense>
        {productionAnalyticsEnabled ? <Suspense fallback={null}><VercelInsights /></Suspense> : null}
      </div>
    </MotionConfig>
  );
}

export default App;
