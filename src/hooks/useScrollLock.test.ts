import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useScrollLock } from "@/hooks/useScrollLock";

const isLocked = () => document.documentElement.style.overflow === "hidden" && document.body.style.overflow === "hidden";
const isFree = () => document.documentElement.style.overflow === "" && document.body.style.overflow === "";

describe("useScrollLock", () => {
  afterEach(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  it("trava html e body enquanto ativo e destrava ao desativar", () => {
    // Arrange
    const { rerender } = renderHook(({ on }) => useScrollLock(on), { initialProps: { on: true } });
    expect(isLocked()).toBe(true);

    // Act
    rerender({ on: false });

    // Assert
    expect(isFree()).toBe(true);
  });

  it("com dois locks, soltar um mantém a página travada e soltar o outro destrava", () => {
    // Arrange: gaveta e modal abertos ao mesmo tempo.
    const drawer = renderHook(({ on }) => useScrollLock(on), { initialProps: { on: true } });
    const modal = renderHook(({ on }) => useScrollLock(on), { initialProps: { on: true } });
    expect(isLocked()).toBe(true);

    // Act + Assert: fecha o modal, a gaveta ainda segura a trava.
    modal.rerender({ on: false });
    expect(isLocked()).toBe(true);

    // Act + Assert: fecha a gaveta, a página volta a rolar.
    drawer.rerender({ on: false });
    expect(isFree()).toBe(true);
  });

  it("desmontar um componente com lock ativo também libera a referência", () => {
    const a = renderHook(() => useScrollLock(true));
    const b = renderHook(() => useScrollLock(true));

    a.unmount();
    expect(isLocked()).toBe(true);

    b.unmount();
    expect(isFree()).toBe(true);
  });

  it("inativo desde o início não mexe no overflow", () => {
    renderHook(() => useScrollLock(false));

    expect(isFree()).toBe(true);
  });
});
