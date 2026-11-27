import { describe, expect, it } from "vitest";
import { highlight, highlightLines } from "./highlight";

const strings = (src: string) => highlight(src).filter((t) => t.cls === "s").map((t) => t.text);

describe("highlight", () => {
  it("reconhece strings com qualquer letra, inclusive n", () => {
    expect(strings(`const a = ['return', 'approve'];`)).toEqual(["'return'", "'approve'"]);
    expect(strings(`throw new RangeError("Pesos precisam ser números positivos");`)).toEqual(['"Pesos precisam ser números positivos"']);
  });

  it("aceita aspas escapadas e não atravessa a quebra de linha", () => {
    expect(strings(`const a = 'it\\'s';`)).toEqual(["'it\\'s'"]);
    expect(strings("const a = 'x\nconst b = 1;'")).toEqual([]);
  });

  it("palavra reservada dentro de string não vira palavra-chave", () => {
    const kws = highlight(`const SEGREGATED = ['return'];`).filter((t) => t.cls === "k").map((t) => t.text);
    expect(kws).toEqual(["const"]);
  });

  it("divide em linhas preservando o texto", () => {
    const src = "/**\n * a\n */\nconst x = 1;";
    expect(highlightLines(src).map((l) => l.map((t) => t.text).join(""))).toEqual(src.split("\n"));
  });
});
