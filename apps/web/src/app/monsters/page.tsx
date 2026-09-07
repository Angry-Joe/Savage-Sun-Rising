import Link from "next/link";
import { loadAthasMonsters } from "@/lib/fixtures";

export default function MonstersPage() {
  const items = loadAthasMonsters().filter((m) =>
    m.allowedSettings.includes("ds")
  );

  return (
    <div>
      <h1 style={{ color: "var(--ochre)" }}>Monsters — Athas</h1>
      <p className="meta">
        Sample rows shaped like complete-compendium{" "}
        <code>monster_index</code> with <code>allowedSettings</code> including{" "}
        <code>ds</code>.
      </p>
      {items.map((m) => (
        <article key={m.id} className="card">
          <h3>
            <Link href={`/monsters/${encodeURIComponent(m.id)}`}>{m.name}</Link>
          </h3>
          <div>
            {m.cr !== undefined && <span className="badge">CR {m.cr}</span>}
            {m.size && <span className="badge">{m.size}</span>}
            {m.type && <span className="badge">{m.type}</span>}
            {m.allowedSettings.map((s) => (
              <span key={s} className="badge">
                {s}
              </span>
            ))}
          </div>
          <p className="meta">{m.summary}</p>
        </article>
      ))}
    </div>
  );
}
