import Link from "next/link";
import { ClassBadges, RulesetBadges, SettingBadges } from "@/components/content-badges";
import DbError from "@/components/db-error";
import FilterBar from "@/components/filter-bar";
import Pager from "@/components/pager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listSpells, pageOf, safe, spellFiltersFrom, type SearchParams } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spells" };

export default async function SpellsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const f = spellFiltersFrom(sp);
  const page = pageOf(sp);
  const res = await safe(() => listSpells(f, page));

  return (
    <div>
      <h1 className="mb-2">Spells</h1>
      <p className="mb-6 text-muted-foreground">Wizard and Priest magic. ✦ marks a Dark Sun overlay.</p>
      <FilterBar
        action="/spells"
        fields={[
          { kind: "text", name: "q", label: "Name", value: f.q, placeholder: "e.g. fireball" },
          {
            kind: "select", name: "class", label: "Class", value: f.cls,
            options: [{ value: "Wizard", label: "Wizard" }, { value: "Priest", label: "Priest" }],
          },
          {
            kind: "select", name: "level", label: "Level", value: f.level?.toString(),
            options: Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
          },
          {
            kind: "select", name: "ruleset", label: "Ruleset", value: f.ruleset,
            options: [{ value: "2e", label: "2e" }, { value: "2e-rev", label: "2e-rev" }, { value: "5e", label: "5e" }],
          },
          { kind: "select", name: "ds", label: "Setting", value: f.ds ? "1" : undefined, options: [{ value: "1", label: "Dark Sun only" }] },
          { kind: "select", name: "verified", label: "Verified", value: f.verified ? "1" : undefined, options: [{ value: "1", label: "Verified only" }] },
        ]}
      />
      {!res.ok ? (
        <DbError message={res.error} />
      ) : (
        <>
          <Pager base="/spells" sp={sp} page={page} total={res.data.total} />
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-20">Level</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Rules / setting</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {res.data.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-normal font-medium">
                      <Link href={`/spells/${encodeURIComponent(r.id)}`} className="text-parchment hover:text-ochre">
                        {r.name || r.id}
                      </Link>
                    </TableCell>
                    <TableCell>{r.level ?? "-"}</TableCell>
                    <TableCell className="whitespace-normal">{r.school ?? "-"}</TableCell>
                    <TableCell><div className="flex gap-1"><ClassBadges row={r} /></div></TableCell>
                    <TableCell><div className="flex flex-wrap gap-1"><RulesetBadges row={r} /><SettingBadges row={r} /></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pager base="/spells" sp={sp} page={page} total={res.data.total} />
        </>
      )}
    </div>
  );
}
