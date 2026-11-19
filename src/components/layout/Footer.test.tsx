import { screen, waitFor } from "@testing-library/react";
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

  it("voto dado antes de a API responder é enviado assim que ela confirma que está no ar", async () => {
    // Arrange: a leitura dos votos só responde quando o teste liberar.
    let releaseVotes: (r: Response) => void = () => undefined;
    const votesLoaded = new Promise<Response>((resolve) => (releaseVotes = resolve));
    const posts: unknown[] = [];
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes("/api/votes") && init?.method === "POST") {
        posts.push(JSON.parse(String(init.body)));
        return jsonResponse({ available: true, likes: 8, dislikes: 1, vote: "up" });
      }
      if (url.includes("/api/votes")) return votesLoaded;
      return jsonResponse({ available: false });
    });
    const { user } = renderWithPortfolio(<Footer />);

    // Act: vota enquanto a API ainda não respondeu e, depois, a API responde.
    await user.click(screen.getByRole("button", { name: "Gostei, 0" }));
    releaseVotes(jsonResponse({ available: true, likes: 7, dislikes: 1, vote: null }));

    // Assert: o voto vai para o servidor e o total exibido é o que ele confirmou.
    await waitFor(() => expect(posts).toEqual([{ vote: "up" }]));
    expect(await screen.findByRole("button", { name: "Gostei, 8" })).toHaveAttribute("aria-pressed", "true");
  });

  it("ignora resposta de votos com contagens inválidas e mantém o modo local", async () => {
    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).includes("/api/votes") ? jsonResponse({ available: true, likes: "muitos", dislikes: -3, vote: "up" }) : jsonResponse({ available: false }),
    );
    renderWithPortfolio(<Footer />);
    await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes("/api/votes"))).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Com "up" aceito, o botão estaria pressionado; com a resposta descartada, continua o estado local.
    expect(screen.getByRole("button", { name: "Gostei, 0" })).toHaveAttribute("aria-pressed", "false");
  });
});
