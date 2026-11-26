import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/", "v1/", "node_modules/", "public/", "output/", "tmp/", ".playwright-cli/", ".playwright-mcp/", "playwright-report/", "test-results/", ".claude/", ".remember/"]),
  {
    files: ["**/*.{js,ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    // App (navegador): regras de hooks e acessibilidade de JSX.
    files: ["src/**/*.{ts,tsx}"],
    extends: [jsxA11y.flatConfigs.recommended],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: globals.browser },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    // Vercel Functions, scripts de build e arquivos de configuração rodam em Node.
    files: ["api/**/*.ts", "scripts/**/*.ts", "e2e/**/*.ts", "*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
  },
]);
