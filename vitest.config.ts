import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Reaproveita plugins (inclusive a mídia dos projetos) e o alias "@" do Vite; só acrescenta a configuração de testes.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
      setupFiles: ["./src/test/setup.ts"],
      // Testes de componente com jsdom passam de 5 s em máquinas lentas; folga para não dar falso negativo.
      testTimeout: 30_000,
      pool: "forks",
      maxWorkers: 2,
      // Reaproveita os workers entre arquivos: em máquina carregada, subir um worker por arquivo
      // estourava o tempo de início do pool. O estado global é reposto no beforeEach do setup.
      isolate: false,
      // Encerrar o jsdom demora em máquina carregada; sem folga, o worker é morto ao parar e a execução falha.
      teardownTimeout: 60_000,
    },
  }),
);
