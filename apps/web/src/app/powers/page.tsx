import Link from "next/link";
import { CombatModeBadge, RulesetBadges, SettingBadges } from "@/components/content-badges";
import DbError from "@/components/db-error";
import FilterBar from "@/components/filter-bar";
import Pager from "@/components/pager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DISCIPLINES,
  TIERS,
  listPowers,
  pageOf,
  powerFiltersFrom,
  safe,
  type SearchParams,
} from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Psionic Powers" };

export default async function PowersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const f = powerFiltersFrom(sp);
  const page = pageOf(sp);
  const res = await safe(() => listPowers(f, page));

  return (
    <div>
      <h1 className="mb-2">Psionic Powers</h1>
      <p className="mb-6 text-muted-foreground">
        The Way. Combat mode marks psionic attack and defense modes.
      </p>
      <FilterBar
        action="/powers"
        fields={[
          { kind: "text", name: "q", label: "Name", value: f.q, placeholder: "e.g. mind thrust" },
          { kind: "select", name: "discipline", label: "Discipline", value: f.discipline, options: DISCIPLINES.map((d) => ({ value: d, label: d })) },
          { kind: "select", name: "tier", label: "Tier", value: f.tier, options: TIERS.map((t) => ({ value: t, label: t })) },
          {
            kind: "select", name: "combatMode", label: "Combat mode", value: f.combatMode,
            options: [{ value: "Att", label: "Attack" }, { value: "Def", label: "Defense" }, { value: "N/A", label: "Non-combat" }],
          },
          {
            kind: "select", name: "ruleset", label: "Ruleset", value: f.ruleset,
            options: [{ value: "2e", label: "2e" }, { value: "2e-rev", label: "2e-rev" }, { value: "5e", label: "5e" }],
          },
        ]}
      />
      {!res.ok ? (
        <DbError message={res.error} />
      ) : (
        <>
          <Pager base="/powers" sp={sp} page={page} total={res.data.total} />
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Combat</TableHead>
                  <TableHead>Rules / setting</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {res.data.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-normal font-medium">
                      <Link href={`/powers/${encodeURIComponent(r.id)}`} className="text-parchment hover:text-ochre">
                        {r.name || r.id}
                      </Link>
                    </TableCell>
                    <TableCell>{r.discipline ?? "-"}</TableCell>
                    <TableCell>{r.tier ?? "-"}</TableCell>
                    <TableCell><CombatModeBadge mode={r.combatMode} /></TableCell>
                    <TableCell><div className="flex flex-wrap gap-1"><RulesetBadges row={r} /><SettingBadges row={r} /></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pager base="/powers" sp={sp} page={page} total={res.data.total} />
        </>
      )}
    </div>
  );
}
