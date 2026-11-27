import { highlight, highlightLines, type Token } from "@/lib/highlight";

const Tok = ({ t }: { t: Token }) => (t.cls ? <span className={t.cls}>{t.text}</span> : <>{t.text}</>);

interface CodeBlockProps {
  code: string;
  lines?: boolean;
  label: string;
  /** Numera as linhas a partir deste número (linha do arquivo de origem). */
  start?: number;
  wrap?: boolean;
}

/** Bloco de código com realce; rolável e focável pelo teclado. */
export function CodeBlock({ code, lines = false, label, start, wrap = false }: CodeBlockProps) {
  const numbered = start !== undefined;
  const cls = [numbered ? "numbered" : "", wrap ? "wrap" : ""].filter(Boolean).join(" ") || undefined;
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- bloco rolável precisa ser alcançável pelo teclado
    <pre tabIndex={0} aria-label={label} className={cls}>
      <code style={numbered ? ({ counterReset: `ln ${start - 1}` } as React.CSSProperties) : undefined}>
        {lines || numbered
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
