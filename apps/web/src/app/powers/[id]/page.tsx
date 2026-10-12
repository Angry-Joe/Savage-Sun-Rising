import { notFound, redirect } from "next/navigation";
import DbError from "@/components/db-error";
import SpellPowerDetail from "@/components/spell-power-detail";
import { getSpellPower, safe } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PowerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await safe(() => getSpellPower(decodeURIComponent(id)));
  if (!res.ok) return <DbError message={res.error} />;
  if (!res.data) notFound();
  if (res.data.kind !== "psionic") redirect(`/spells/${encodeURIComponent(res.data.id)}`);
  return <SpellPowerDetail row={res.data} />;
}
