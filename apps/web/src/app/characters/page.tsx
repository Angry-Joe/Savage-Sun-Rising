import DbError from "@/components/db-error";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { safe } from "@/lib/content";
import { requireUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Characters" };

export default async function CharactersPage() {
  const ownerId = await requireUserId("/characters");
  const res = await safe(() =>
    prisma.character.findMany({
      where: { ownerId },
      select: { id: true, name: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    })
  );

  return (
    <div className="space-y-6">
      <h1>My Characters</h1>
      <p className="text-muted-foreground">
        Signed in as Authentik user <code>{ownerId}</code>.
      </p>
      {!res.ok ? (
        <DbError message={res.error} />
      ) : res.data.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl text-ochre">No characters yet</CardTitle>
            <CardDescription className="text-lg">
              Character creation is the next milestone. Characters you create will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {res.data.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="font-heading text-xl text-ochre">{c.name}</CardTitle>
                <CardDescription>Updated {c.updatedAt.toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
