import Link from "next/link";
import { notFound } from "next/navigation";
import { getMonster } from "@/lib/fixtures";

type Params = { id: string };

export default function MonsterDetailPage({ params }: { params: Params }) {
  const { id } = params;
  const m = getMonster(decodeURIComponent(id));
  if (!m) notFound();

  return (
    <div>
      <p className="meta">
        <Link href="/monsters">← Athas Monsters</Link>
      </p>
      <h1 style={{ color: "var(--ochre)" }}>{m.name}</h1>
      <div>
        {m.cr !== undefined && <span className="badge">CR {m.cr}</span>}
        {m.size && <span className="badge">{m.size}</span>}
        {m.type && <span className="badge">{m.type}</span>}
        {m.source && <span className="badge">{m.source}</span>}
      </div>
      <p>{m.summary}</p>
      <p className="meta">
        id: <code>{m.id}</code>
      </p>
      <div className="detail-block">{JSON.stringify(m, null, 2)}</div>
    </div>
  );
}
