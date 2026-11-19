import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Reaproveita plugins e o alias "@" do Vite; só acrescenta a configuração de testes.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./src/test/setup.ts"],
      // Testes de componente com jsdom passam de 5 s em máquinas lentas; folga para não dar falso negativo.
      testTimeout: 30_000,
      // Worker threads sobem mais rápido que processos (forks); com poucos workers, a máquina carregada
      // não estoura o tempo de início do pool ("Timeout waiting for worker to respond").
      pool: "threads",
      maxWorkers: 2,
    },
  }),
);
