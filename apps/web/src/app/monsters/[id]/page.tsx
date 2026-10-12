import Link from "next/link";
import { notFound } from "next/navigation";
import DbError from "@/components/db-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { MONSTER_FIELDS, getMonster, safe } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function MonsterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await safe(() => getMonster(decodeURIComponent(id)));
  if (!res.ok) return <DbError message={res.error} />;
  const m = res.data;
  if (!m) notFound();
  const data = (m.data ?? {}) as { sb?: Record<string, string>; page?: string; src?: string[] };
  const sb = data.sb ?? {};
  const order = Object.keys(MONSTER_FIELDS).filter((k) => sb[k]);

  return (
    <article className="space-y-6">
      <p>
        <Link href={m.isAthas ? "/monsters" : "/monsters?all=1"} className="text-ochre">
          ← Monsters
        </Link>
      </p>
      <header className="space-y-3">
        <h1>{m.name}</h1>
        <div className="flex flex-wrap gap-2">
          {m.isAthas ? (
            <Badge className="border-ember/60 bg-ember/15 text-ember">Dark Sun</Badge>
          ) : (
            m.setting && <Badge variant="outline">{m.setting}</Badge>
          )}
          {m.psionic && <Badge variant="outline" className="text-ochre">psionic</Badge>}
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl text-ochre">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {order.length === 0 ? (
            <p className="text-muted-foreground">No statblock in the index for this entry.</p>
          ) : (
            <Table>
              <TableBody>
                {order.map((k) => (
                  <TableRow key={k}>
                    <TableHead className="w-60 align-top font-semibold text-muted-foreground">{MONSTER_FIELDS[k]}</TableHead>
                    <TableCell className="whitespace-normal">{sb[k]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <p className="text-base text-muted-foreground">
        Compendium page: {data.page ?? m.name} · id <code>{m.id}</code>
      </p>
    </article>
  );
}
