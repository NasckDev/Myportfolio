import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/jetbrains-mono";
import "./styles/tokens.css";
import "./styles/shell.css";
import "./styles/components.css";
import "./styles/cover.css";
import "./styles/additions.css";
import App from "./App";
import { applyPrefs, getPrefs } from "./lib/prefs";

applyPrefs(getPrefs());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
