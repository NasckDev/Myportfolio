import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/Footer";
import { jsonResponse } from "@/test/http";
import { renderWithPortfolio } from "@/test/render";

/** API de contadores respondendo com um total de visitas; votos ficam indisponíveis. */
function mockVisitsApi(visits: number) {
  vi.mocked(fetch).mockImplementation(async (input) =>
    String(input).includes("/api/visits") ? jsonResponse({ available: true, visits }) : jsonResponse({ available: false }),
  );
}

describe("Footer", () => {
  it("usa o singular com uma visita: '1 pessoa passou por aqui'", async () => {
    // Arrange
    mockVisitsApi(1);

    // Act
    renderWithPortfolio(<Footer />);

    // Assert
    expect(await screen.findByText("pessoa passou por aqui")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("pessoas passaram por aqui")).not.toBeInTheDocument();
  });

  it("usa o plural e o separador de milhar pt-BR com várias visitas", async () => {
    mockVisitsApi(1234);

    renderWithPortfolio(<Footer />);

    expect(await screen.findByText("pessoas passaram por aqui")).toBeInTheDocument();
    expect(screen.getByText("1.234")).toBeInTheDocument();
  });

  it("conta a visita com POST na primeira carga da sessão e só lê (GET) depois", async () => {
    mockVisitsApi(7);
    const first = renderWithPortfolio(<Footer />);
    await screen.findByText("7");
    first.unmount();

    renderWithPortfolio(<Footer />);
    await screen.findByText("7");

    const visitCalls = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes("/api/visits"));
    expect(visitCalls.map(([, init]) => init?.method)).toEqual(["POST", "GET"]);
  });

  it("sem API, cai no contador local e ainda mostra a visita atual", async () => {
    // fetch padrão do setup responde { available: false }.
    renderWithPortfolio(<Footer />);

    expect(await screen.findByText("pessoa passou por aqui")).toBeInTheDocument();
  });

  it("marcar 'Gostei' pressiona o botão, soma o voto e agradece", async () => {
    const { user } = renderWithPortfolio(<Footer />);
    const gostei = screen.getByRole("button", { name: "Gostei, 0" });

    await user.click(gostei);

    expect(screen.getByRole("button", { name: "Gostei, 1" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Valeu! Que bom que curtiu.")).toBeInTheDocument();
  });
});
