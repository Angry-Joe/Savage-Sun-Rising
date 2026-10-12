import Link from "next/link";
import DbError from "@/components/db-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { contentCounts, safe } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const counts = await safe(contentCounts);
  const tiles = [
    {
      href: "/spells",
      title: "Spells",
      body: "Wizard and Priest spells with 2e rules and Dark Sun overlays.",
      n: counts.data?.spells,
    },
    {
      href: "/powers",
      title: "Psionic Powers",
      body: "The Way: disciplines, sciences and devotions, 2e and 2e-revised, with combat modes.",
      n: counts.data?.powers,
    },
    {
      href: "/monsters",
      title: "Monsters",
      body: "Creatures of Athas first; the rest of the compendium one click away.",
      n: counts.data?.athas,
      note: counts.data ? `${counts.data.monsters} total` : undefined,
    },
    {
      href: "/characters",
      title: "My Characters",
      body: "Your heroes, tied to your Authentik account. Sign-in required.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl">Under the Crimson Sun</h1>
        <p className="max-w-3xl text-xl text-muted-foreground">
          A reference and character tool for Athas. Spells, psionics and monsters come straight
          from the Depp-Magic and complete-compendium corpora.
        </p>
      </section>
      {counts.error && <DbError message={counts.error} />}
      <div className="grid gap-5 sm:grid-cols-2">
        {tiles.map((t) => (
          <Card key={t.href} className="transition-colors hover:border-ochre/60">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-ochre">{t.title}</CardTitle>
              <CardDescription className="text-lg">{t.body}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t.n !== undefined ? `${t.n} entries` : ""}
                {t.note ? ` · ${t.note}` : ""}
              </span>
              <Button asChild>
                <Link href={t.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
