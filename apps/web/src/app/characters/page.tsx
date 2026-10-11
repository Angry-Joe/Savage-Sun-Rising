import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const ownerId = await requireUserId("/characters");

  let characters: { id: string; name: string; updatedAt: Date }[] = [];
  let dbError: string | null = null;
  try {
    characters = await prisma.character.findMany({
      where: { ownerId },
      select: { id: true, name: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    dbError = "Character database is not reachable right now.";
  }

  return (
    <div>
      <h1 style={{ color: "var(--ochre)" }}>My Characters</h1>
      <p className="meta">
        Owner id (Authentik <code>sub</code>): <code>{ownerId}</code>
      </p>
      {dbError ? (
        <p className="meta">{dbError}</p>
      ) : characters.length === 0 ? (
        <p className="meta">No characters yet.</p>
      ) : (
        characters.map((c) => (
          <article key={c.id} className="card">
            <h3>{c.name}</h3>
            <p className="meta">updated {c.updatedAt.toISOString()}</p>
          </article>
        ))
      )}
    </div>
  );
}
