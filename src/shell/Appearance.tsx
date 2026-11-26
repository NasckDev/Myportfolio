import type { CSSProperties } from "react";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { ACCENTS, resetPrefs, setPref, usePrefs, type AccentKey, type Prefs } from "@/lib/prefs";
import { useUi } from "./ui";

type Option<K extends keyof Prefs> = readonly [Prefs[K], string];

function Radios<K extends "theme" | "corners" | "motion">({ name, legend, options }: { name: K; legend: string; options: readonly Option<K>[] }) {
  const prefs = usePrefs();
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="opt">
        {options.map(([value, label]) => (
          <label key={String(value)}>
            <input type="radio" name={name} value={String(value)} checked={prefs[name] === value} onChange={() => setPref(name, value)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function AppearanceBody() {
  const prefs = usePrefs();
  const { closePanel, toast } = useUi();
  return (
    <>
      <div className="tk-head">
        <h2 id="tk-t">Aparência</h2>
        <button type="button" className="icon-btn" aria-label="Fechar" onClick={closePanel}>
          <Icon name="x" />
        </button>
      </div>
      <p className="small muted">O site é construído sobre design tokens, como o Nasck UI: cor, forma e movimento são alterados em um só lugar.</p>
      <Radios name="theme" legend="Tema" options={[["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]]} />
      <fieldset>
        <legend>Cor de destaque</legend>
        <div className="opt sw">
          {(Object.entries(ACCENTS) as [AccentKey, readonly [string, string, string]][]).map(([k, [c, , n]]) => (
            <label key={k} title={n}>
              <input type="radio" name="accent" value={k} aria-label={n} checked={prefs.accent === k} onChange={() => setPref("accent", k)} />
              <span style={{ "--c": c } as CSSProperties} />
            </label>
          ))}
        </div>
      </fieldset>
      <Radios name="corners" legend="Cantos" options={[["round", "Redondos"], ["square", "Retos"]]} />
      <Radios name="motion" legend="Movimento" options={[["auto", "Automático"], ["full", "Completo"], ["reduced", "Suave"]]} />
      <fieldset>
        <button
          type="button"
          className="btn btn-line"
          onClick={() => {
            resetPrefs();
            toast("Aparência restaurada");
          }}
        >
          Restaurar padrão
        </button>
      </fieldset>
    </>
  );
}

export function Appearance() {
  const { panel, closePanel } = useUi();
  return (
    <Dialog open={panel === "appearance"} id="tokens" labelledBy="tk-t" onClose={() => panel === "appearance" && closePanel()}>
      <AppearanceBody />
    </Dialog>
  );
}
