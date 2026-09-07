import Link from "next/link";
import { filterSpellPowers, loadSpellPowers } from "@/lib/fixtures";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function SpellsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const verifiedRaw = first(sp.verified);
  const filters = {
    verified:
      verifiedRaw === "true" ? true : verifiedRaw === "false" ? false : undefined,
    setting: first(sp.setting),
    ruleset: first(sp.ruleset),
    combatMode: first(sp.combatMode),
    q: first(sp.q),
  };

  const items = filterSpellPowers(loadSpellPowers(), filters);

  return (
    <div>
      <h1 style={{ color: "var(--ochre)" }}>Spells &amp; Powers</h1>
      <p className="meta">
        Read-only list from tiny fixtures. Filter by verified, setting,
        ruleset, combatMode.
      </p>

      <form className="filters" method="get">
        <label>
          Search
          <input name="q" defaultValue={filters.q ?? ""} placeholder="name…" />
        </label>
        <label>
          Verified
          <select name="verified" defaultValue={verifiedRaw ?? ""}>
            <option value="">Any</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </label>
        <label>
          Setting
          <select name="setting" defaultValue={filters.setting ?? ""}>
            <option value="">Any</option>
            <option value="ds">ds</option>
            <option value="2e">2e</option>
            <option value="2e-rev">2e-rev</option>
            <option value="5e">5e</option>
          </select>
        </label>
        <label>
          Ruleset
          <select name="ruleset" defaultValue={filters.ruleset ?? ""}>
            <option value="">Any</option>
            <option value="ds">ds</option>
            <option value="2e">2e</option>
            <option value="2e-rev">2e-rev</option>
            <option value="5e">5e</option>
          </select>
        </label>
        <label>
          Combat mode
          <select name="combatMode" defaultValue={filters.combatMode ?? ""}>
            <option value="">Any</option>
            <option value="N/A">N/A</option>
            <option value="Att">Att</option>
            <option value="Def">Def</option>
          </select>
        </label>
        <label style={{ justifyContent: "flex-end" }}>
          &nbsp;
          <button type="submit">Apply</button>
        </label>
      </form>

      <p className="meta">{items.length} result(s)</p>

      {items.map((item) => (
        <article key={item.id} className="card">
          <h3>
            <Link href={`/spells/${encodeURIComponent(item.id)}`}>
              {item.name}
            </Link>
          </h3>
          <div>
            <span className="badge">{item.kind}</span>
            <span className={`badge ${item.verified ? "ok" : "warn"}`}>
              {item.verified ? "verified" : "unverified"}
            </span>
            <span className="badge">{item.combatMode}</span>
            {item.allowedCampaignSettings.map((c) => (
              <span key={c} className="badge">
                set:{c}
              </span>
            ))}
            {item.allowedRulesets.map((c) => (
              <span key={`r-${c}`} className="badge">
                rules:{c}
              </span>
            ))}
          </div>
          <p className="meta">{item.summary}</p>
        </article>
      ))}
    </div>
  );
}
