import type { ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import App from "@/App";
import { RouterProvider } from "@/router/router";
import { UiProvider } from "@/shell/ui";

/** Renderiza dentro dos providers do app (roteador e UI) e devolve um userEvent pronto. */
export function renderWithApp(ui: ReactElement): RenderResult & { user: UserEvent } {
  const user = userEvent.setup();
  return {
    user,
    ...render(
      <RouterProvider>
        <UiProvider>{ui}</UiProvider>
      </RouterProvider>,
    ),
  };
}

/** Monta o app inteiro numa rota. */
export function renderAppAt(path: string): RenderResult & { user: UserEvent } {
  history.replaceState(null, "", path);
  const user = userEvent.setup();
  return { user, ...render(<App />) };
}
