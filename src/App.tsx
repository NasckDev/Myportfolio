import { preloadRoute } from "@/pages/registry";
import { RouterProvider, setPagePreloader } from "@/router/router";
import { Shell } from "@/shell/Shell";
import { UiProvider } from "@/shell/ui";

setPagePreloader(preloadRoute);

export default function App() {
  return (
    <RouterProvider>
      <UiProvider>
        <Shell />
      </UiProvider>
    </RouterProvider>
  );
}
