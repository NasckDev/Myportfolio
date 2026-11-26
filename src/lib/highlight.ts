/** Realce de sintaxe mínimo (TypeScript, o bastante para os trechos do portfólio). */
export interface Token {
  cls: "" | "c" | "s" | "k" | "n" | "t" | "f";
  text: string;
}

const RE =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|('(?:\.|[^'\\n])*'|"(?:\.|[^"\\n])*")|\b(import|from|export|function|return|const|let|if|for|of|while|break|continue|interface|type|readonly|new|throw|null|undefined|true|false)\b|\b(\d[\d_]*(?:\.\d+)?)\b|\b([A-Z][A-Za-z0-9_]*)\b|\b([a-z_$][\w$]*)(?=\s*\()/g;

export function highlight(src: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  RE.lastIndex = 0;
  for (let m = RE.exec(src); m; m = RE.exec(src)) {
    if (m.index > last) out.push({ cls: "", text: src.slice(last, m.index) });
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "k" : m[4] ? "n" : m[5] ? "t" : "f";
    out.push({ cls, text: m[0] });
    last = RE.lastIndex;
  }
  if (last < src.length) out.push({ cls: "", text: src.slice(last) });
  return out;
}

/** Divide os tokens em linhas (um comentário de várias linhas vira um token por linha). */
export function highlightLines(src: string): Token[][] {
  const lines: Token[][] = [[]];
  for (const tok of highlight(src)) {
    const parts = tok.text.split("\n");
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1]!.push({ cls: tok.cls, text: p });
    });
  }
  return lines;
}
