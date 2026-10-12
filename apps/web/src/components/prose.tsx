import { Fragment, type ReactNode } from "react";

/** Minimal renderer for Depp-Magic description text (paragraphs, **bold**, _italic_). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={i++} className="text-ochre">{inline(tok.slice(2, -2))}</strong>);
    else out.push(<em key={i++}>{inline(tok.slice(1, -1))}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Prose({ text }: { text?: string | null }) {
  if (!text) return <p className="text-muted-foreground">No description.</p>;
  const paras = String(text).split(/\n\s*\n/).filter((p) => p.trim() !== "");
  return (
    <div className="max-w-prose space-y-4 text-lg leading-relaxed">
      {paras.map((p, idx) => (
        <p key={idx}>
          {p.split("\n").map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {inline(line)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
