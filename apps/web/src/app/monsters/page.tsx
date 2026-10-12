import Link from "next/link";
import DbError from "@/components/db-error";
import FilterBar from "@/components/filter-bar";
import Pager from "@/components/pager";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listMonsters, monsterFiltersFrom, pageOf, safe, type SearchParams } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Monsters" };

export default async function MonstersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const f = monsterFiltersFrom(sp);
  const page = pageOf(sp);
  const res = await safe(() => listMonsters(f, page));

  return (
    <div>
      <h1 className="mb-2">{f.all ? "Monsters - all settings" : "Monsters of Athas"}</h1>
      <p className="mb-6 text-muted-foreground">From the complete-compendium monster index.</p>
      <FilterBar
        action="/monsters"
        fields={[
          { kind: "text", name: "q", label: "Name", value: f.q, placeholder: "e.g. kank" },
          { kind: "select", name: "all", label: "Setting", value: f.all ? "1" : undefined, options: [{ value: "1", label: "All settings" }] },
          { kind: "select", name: "psionic", label: "Psionic", value: f.psionic ? "1" : undefined, options: [{ value: "1", label: "Psionic only" }] },
        ]}
      />
      {!res.ok ? (
        <DbError message={res.error} />
      ) : (
        <>
          <Pager base="/monsters" sp={sp} page={page} total={res.data.total} />
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-20">HD</TableHead>
                  <TableHead className="w-20">AC</TableHead>
                  <TableHead className="w-24">XP</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Setting</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {res.data.rows.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-normal font-medium">
                      <Link href={`/monsters/${encodeURIComponent(m.id)}`} className="text-parchment hover:text-ochre">
                        {m.name}
                      </Link>
                      {m.psionic && <Badge variant="outline" className="ml-2 text-ochre">psionic</Badge>}
                    </TableCell>
                    <TableCell>{m.hitDice !== null ? Math.floor(m.hitDice) : "-"}</TableCell>
                    <TableCell>{m.armorClass ?? "-"}</TableCell>
                    <TableCell>{m.xp ?? "-"}</TableCell>
                    <TableCell>{m.size ?? "-"}</TableCell>
                    <TableCell className="whitespace-normal">
                      {m.isAthas ? <Badge className="border-ember/60 bg-ember/15 text-ember">Dark Sun</Badge> : m.setting ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pager base="/monsters" sp={sp} page={page} total={res.data.total} />
        </>
      )}
    </div>
  );
}
