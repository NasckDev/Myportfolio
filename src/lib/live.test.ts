import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type LiveModule = typeof import("@/lib/live");

/** requestAnimationFrame controlado: os frames só rodam quando o teste chama `frame(t)`. */
const pending = new Map<number, FrameRequestCallback>();
let nextId = 1;

function frame(t: number) {
  const callbacks = [...pending.values()];
  pending.clear();
  callbacks.forEach((cb) => cb(t));
}

function setScroll(y: number) {
  Object.defineProperty(document.documentElement, "scrollTop", { configurable: true, get: () => y });
}

let mod: LiveModule;

beforeEach(async () => {
  pending.clear();
  nextId = 1;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = nextId++;
    pending.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => pending.delete(id));
  setScroll(0);
  // O loop guarda estado no módulo: cada teste recebe uma instância nova.
  vi.resetModules();
  mod = await import("@/lib/live");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("onScrollFrame", () => {
  it("roda o assinante no primeiro frame e não repete enquanto o scroll não muda", () => {
    // Arrange
    const fn = vi.fn();
    mod.onScrollFrame(fn);

    // Act
    frame(16);
    frame(32);
    frame(48);

    // Assert
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(16);
  });

  it("roda de novo quando o scroll muda e atualiza live.scrollY", () => {
    const fn = vi.fn();
    mod.onScrollFrame(fn);
    frame(16);

    setScroll(240);
    frame(32);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(mod.live.scrollY).toBe(240);
  });

  it("depois de alguns frames sem mudança o loop dorme e para de agendar frames", () => {
    mod.onScrollFrame(vi.fn());

    for (let i = 1; i <= 20 && pending.size > 0; i++) frame(i * 16);

    expect(pending.size).toBe(0);
  });

  it("um evento de scroll acorda o loop que estava dormindo", () => {
    const fn = vi.fn();
    mod.onScrollFrame(fn);
    for (let i = 1; i <= 20 && pending.size > 0; i++) frame(i * 16);
    fn.mockClear();

    window.dispatchEvent(new Event("scroll"));
    frame(1000);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cancelar a inscrição para de chamar o assinante e descarta o frame pendente", () => {
    const fn = vi.fn();
    const off = mod.onScrollFrame(fn);

    off();
    frame(16);
    window.dispatchEvent(new Event("scroll"));
    frame(32);

    expect(fn).not.toHaveBeenCalled();
    expect(pending.size).toBe(0);
  });
});

describe("wake", () => {
  it("com duração, força o assinante a rodar todo frame até o prazo acabar", () => {
    // Arrange: performance.now() = 0, então a janela vai até t = 100.
    vi.spyOn(performance, "now").mockReturnValue(0);
    const fn = vi.fn();
    mod.onScrollFrame(fn);
    frame(10);
    fn.mockClear();

    // Act
    mod.wake(100);
    frame(20);
    frame(50);
    frame(90);
    frame(150);
    frame(170);

    // Assert: 20, 50 e 90 estão dentro da janela; 150 e 170 já passaram dela e o scroll não mudou.
    expect(fn.mock.calls.map(([t]) => t)).toEqual([20, 50, 90]);
  });
});

describe("onFrame", () => {
  it("roda a animação contínua em todo frame enquanto registrada", () => {
    const fn = vi.fn();
    const off = mod.onFrame(fn);

    frame(16);
    frame(32);
    off();
    frame(48);

    expect(fn.mock.calls.map(([t]) => t)).toEqual([16, 32]);
  });
});

describe("setStyle", () => {
  it("escreve a propriedade só quando o valor muda", () => {
    // Arrange
    const el = document.createElement("div");
    const spy = vi.spyOn(el.style, "setProperty");

    // Act
    mod.setStyle(el, "--p", "0.5");
    mod.setStyle(el, "--p", "0.5");
    mod.setStyle(el, "--p", "0.7");

    // Assert
    expect(spy).toHaveBeenCalledTimes(2);
    expect(el.style.getPropertyValue("--p")).toBe("0.7");
  });

  it("mantém o cache separado por elemento e por propriedade", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");

    mod.setStyle(a, "opacity", "1");
    mod.setStyle(b, "opacity", "1");
    mod.setStyle(a, "transform", "none");

    expect(b.style.opacity).toBe("1");
    expect(a.style.transform).toBe("none");
  });

  it("ignora elemento nulo ou indefinido sem lançar erro", () => {
    expect(() => {
      mod.setStyle(null, "opacity", "1");
      mod.setStyle(undefined, "opacity", "1");
    }).not.toThrow();
  });
});

describe("funções de easing", () => {
  it("clamp01 limita ao intervalo [0, 1]", () => {
    expect([mod.clamp01(-2), mod.clamp01(0.3), mod.clamp01(5)]).toEqual([0, 0.3, 1]);
  });

  it("smoothstep preserva as pontas e o meio", () => {
    expect([mod.smoothstep(0), mod.smoothstep(0.5), mod.smoothstep(1)]).toEqual([0, 0.5, 1]);
  });
});
