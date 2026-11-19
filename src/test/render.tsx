import type { ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { PortfolioProvider } from "@/context/PortfolioContext";

/** Renderiza dentro do PortfolioProvider (o app inteiro depende dele) e devolve um userEvent pronto. */
export function renderWithPortfolio(ui: ReactElement): RenderResult & { user: UserEvent } {
  const user = userEvent.setup();
  return { user, ...render(<PortfolioProvider>{ui}</PortfolioProvider>) };
}
