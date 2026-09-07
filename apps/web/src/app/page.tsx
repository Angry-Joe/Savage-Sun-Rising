import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1 style={{ color: "var(--ochre)" }}>Under the Crimson Sun</h1>
      <div className="welcome">
        <p>
          <strong>Savage Sun Rising</strong> is a thin, read-only browser for
          Athasian spells, psionics, and monsters. Content vocabulary aligns
          with Depp-Magic 3.6 overlays (<code>ds</code>, <code>2e</code>,{" "}
          <code>2e-rev</code>, <code>5e</code>).
        </p>
        <p className="meta">
          Palette nods to Brom: deep reds, ochres, parchment. Product app lives
          in <code>apps/web</code>. Legacy Blazor is deprecated and unused.
        </p>
      </div>
      <div className="card">
        <h2>Browse</h2>
        <ul>
          <li>
            <Link href="/spells">Spells &amp; Powers</Link> — filter by
            verified, setting, ruleset, combatMode (Att / Def / N/A)
          </li>
          <li>
            <Link href="/monsters">Athas Monsters</Link> — sample{" "}
            <code>monster_index</code>-shaped rows
          </li>
        </ul>
      </div>
      <div className="card">
        <h2>Local full corpora (later)</h2>
        <p className="meta">
          Point imports at Depp-Magic{" "}
          <code>Reference/spell-powers-official-v3.6.2.json</code> and
          complete-compendium <code>static/tools/monster_index.json</code>. See
          repo root README.
        </p>
      </div>
    </div>
  );
}
