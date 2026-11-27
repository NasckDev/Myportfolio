/**
 * Contagens de testes, E2E e stories exibidas no portfólio, em um só lugar.
 * Cada número precisa vir da execução real no repositório do app (ver relatório de cada agente).
 * `null` = ainda não medido: o número some das frases e dos totais até ser preenchido.
 */
export interface TestCount {
  /** Testes unitários, de componente e de integração somados. */
  unit: number | null;
  /** Cenários de ponta a ponta (Playwright). */
  e2e: number | null;
  /** Stories no Storybook. */
  stories: number | null;
}

export const TEST_COUNTS = {
  juntos: { unit: 539, e2e: 22, stories: null, coreUnit: 231, appUnit: 308, coreCoverage: "99%" },
  insighthub: { unit: 319, e2e: 51, stories: 132 },
  opsflow: { unit: 331, e2e: 108, stories: 129 },
  fiscotrack: { unit: 276, e2e: 15, stories: 118, engineUnit: 73, uiUnit: 203, wrappers: 45 },
  nasckui: { unit: 246, e2e: 25, stories: 246, components: 28, contract: 142 },
  coverlist: { unit: 158, e2e: 29, stories: null },
  garrafao: { unit: 146, e2e: 18, stories: null },
} as const satisfies Record<string, TestCount & Record<string, number | string | null>>;

export type CountedProjectId = keyof typeof TEST_COUNTS;

const values = Object.values(TEST_COUNTS) as TestCount[];

/** Soma de testes automatizados de todos os apps com número medido. */
export const TOTAL_UNIT = values.reduce((sum, c) => sum + (c.unit ?? 0), 0);
/** Soma de cenários de ponta a ponta medidos. */
export const TOTAL_E2E = values.reduce((sum, c) => sum + (c.e2e ?? 0), 0);
