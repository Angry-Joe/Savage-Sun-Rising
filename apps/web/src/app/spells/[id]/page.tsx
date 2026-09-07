import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpellPower } from "@/lib/fixtures";

type Params = { id: string };

export default function SpellDetailPage({ params }: { params: Params }) {
  const { id } = params;
  const item = getSpellPower(decodeURIComponent(id));
  if (!item) notFound();

  return (
    <div>
      <p className="meta">
        <Link href="/spells">← Spells &amp; Powers</Link>
      </p>
      <h1 style={{ color: "var(--ochre)" }}>{item.name}</h1>
      <div>
        <span className="badge">{item.kind}</span>
        <span className={`badge ${item.verified ? "ok" : "warn"}`}>
          {item.verified ? "verified" : "unverified"}
        </span>
        <span className="badge">combatMode: {item.combatMode}</span>
        {item.level !== undefined && (
          <span className="badge">level {item.level}</span>
        )}
      </div>
      <p>{item.summary}</p>
      <p className="meta">
        id: <code>{item.id}</code>
      </p>
      <div className="detail-block">
        {JSON.stringify(
          {
            allowedCampaignSettings: item.allowedCampaignSettings,
            allowedRulesets: item.allowedRulesets,
            campaignSettings: item.campaignSettings,
            rulesets: item.rulesets,
            school: item.school,
            discipline: item.discipline,
          },
          null,
          2
        )}
      </div>
    </div>
  );
}
