import type { Snippet } from "./types";

const JUNTOS_CODE = `/**
 * Divide \`total\` em partes proporcionais aos pesos, em centavos, pelo método do maior resto.
 * A soma das partes é sempre exatamente \`total\`. Pesos todos zero dividem em partes iguais.
 */
export function splitProportional(total: Cents, weights: readonly number[]): Cents[] {
  if (weights.length === 0) return [];
  if (weights.some((w) => w < 0 || !Number.isFinite(w))) throw new RangeError("Pesos precisam ser números positivos");
  const sum = weights.reduce((a, w) => a + w, 0);
  const ws = sum === 0 ? weights.map(() => 1) : weights;
  const wsum = sum === 0 ? ws.length : sum;
  const raw = ws.map((w) => (total * w) / wsum);
  const parts = raw.map((r) => Math.floor(r));
  let rest = total - parts.reduce((a, p) => a + p, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (const { i } of order) {
    if (rest <= 0) break;
    parts[i] = (parts[i] ?? 0) + 1;
    rest -= 1;
  }
  return parts;
}`;

const OPSFLOW_CODE = `/** Ações que não podem ser executadas por quem criou a solicitação. */
const SEGREGATED_ACTIONS: readonly WorkflowAction[] = ['return', 'approve', 'reject'];

function violatesSegregation(
  request: WorkflowRequest,
  action: WorkflowAction,
  actor: Actor,
): boolean {
  return SEGREGATED_ACTIONS.includes(action) && request.requester === actor.name;
}

/** Guardas de papel, estado, dono e segregação, sem considerar comentário. */
export function accessError(
  request: WorkflowRequest,
  action: WorkflowAction,
  actor: Actor,
): TransitionError | null {
  const definition = TRANSITIONS[action];
  if (!definition.from.includes(request.status)) return 'invalid_transition';
  if (!can(actor.role, definition.permission)) return 'forbidden';
  if (violatesOwnership(request, action, actor)) return 'not_owner';
  if (violatesSegregation(request, action, actor)) return 'separation_of_duties';
  return null;
}`;

export const FISCOTRACK_CODE = `import { BR_RENDA_VARIAVEL_RULESETS } from './brRendaVariavel';
import type { RuleSet } from './types';

function isWithin(ruleSet: RuleSet, isoDate: string): boolean {
  const startsBefore = ruleSet.validFrom <= isoDate;
  const endsAfter = ruleSet.validTo === null || isoDate <= ruleSet.validTo;
  return startsBefore && endsAfter;
}

/** Retorna o conjunto de regras vigente na data, ou \`undefined\` se não houver. */
export function getRuleSetFor(
  isoDate: string,
  ruleSets: readonly RuleSet[] = BR_RENDA_VARIAVEL_RULESETS,
): RuleSet | undefined {
  return ruleSets.find((ruleSet) => isWithin(ruleSet, isoDate));
}`;

const NASCKUI_CODE = `function walk(node: ts.Node, visit: (child: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}

/** Props de React: membros de \`interface <Nome>Props\`. */
function reactProps(files: ts.SourceFile[]): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const file of files) {
    walk(file, (node) => {
      if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
        const names = node.members
          .filter(ts.isPropertySignature)
          .map((member) => member.name.getText(file));
        result.set(node.name.text.replace(/Props$/, ''), names);
      }
    });
  }
  return result;
}`;

export const SNIPPETS: readonly Snippet[] = [
  {
    id: "juntos",
    repoName: "juntos",
    file: "packages/core/src/money.ts",
    title: "Divisão proporcional sem perda de centavos",
    why: "Dinheiro é inteiro, em centavos. Para dividir uma conta em partes proporcionais uso o método do maior resto: a soma das partes é sempre exatamente o total, sem centavo sobrando por arredondamento.",
    url: "https://github.com/NasckDev/juntos/blob/HEAD/packages/core/src/money.ts",
    code: JUNTOS_CODE,
  },
  {
    id: "opsflow",
    repoName: "opsflow",
    file: "src/app/domain/workflow-machine.ts",
    title: "Regras de permissão em uma função pura",
    why: "As guardas de estado, papel, dono e segregação de funções ficam em uma função pura, fora dos componentes. A mesma regra decide o que a interface habilita e o que a API simulada recusa.",
    url: "https://github.com/NasckDev/opsflow/blob/HEAD/src/app/domain/workflow-machine.ts",
    code: OPSFLOW_CODE,
  },
  {
    id: "fiscotrack",
    repoName: "fiscotrack",
    file: "packages/engine/src/rules/getRuleSet.ts",
    title: "Regra fiscal selecionada por vigência",
    why: "As regras são dados versionados por vigência. O motor pergunta qual conjunto valia na data da operação; quando a lei muda, entra uma versão nova e o cálculo continua o mesmo.",
    url: "https://github.com/NasckDev/fiscotrack/blob/HEAD/packages/engine/src/rules/getRuleSet.ts",
    code: FISCOTRACK_CODE,
  },
  {
    id: "nasckui",
    repoName: "nasck-ui",
    file: "contract/contract.test.ts",
    title: "Teste de contrato entre React e Angular",
    why: "Para manter a mesma API nos dois frameworks, o teste abre os arquivos com o compilador do TypeScript, extrai as props de cada componente e falha se os pacotes divergirem do contrato.",
    url: "https://github.com/NasckDev/nasck-ui/blob/HEAD/contract/contract.test.ts",
    code: NASCKUI_CODE,
  },
];
