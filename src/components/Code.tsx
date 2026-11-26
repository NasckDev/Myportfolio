import { highlight, highlightLines, type Token } from "@/lib/highlight";

const Tok = ({ t }: { t: Token }) => (t.cls ? <span className={t.cls}>{t.text}</span> : <>{t.text}</>);

/** Bloco de código com realce; rolável e focável pelo teclado. */
export function CodeBlock({ code, lines = false, label }: { code: string; lines?: boolean; label: string }) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- bloco rolável precisa ser alcançável pelo teclado
    <pre tabIndex={0} aria-label={label}>
      <code>
        {lines
          ? highlightLines(code).map((ln, i) => (
              <span className="cl" key={i} style={{ "--l": i } as React.CSSProperties}>
                {ln.map((t, k) => (
                  <Tok t={t} key={k} />
                ))}
              </span>
            ))
          : highlight(code).map((t, k) => <Tok t={t} key={k} />)}
      </code>
    </pre>
  );
}
