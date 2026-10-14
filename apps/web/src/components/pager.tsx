import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE, type SearchParams } from "@/lib/content";

function hrefFor(base: string, sp: SearchParams, page: number) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v === undefined) continue;
    for (const x of Array.isArray(v) ? v : [v]) if (x !== "" && x !== "any") q.append(k, x);
  }
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export default function Pager({
  base,
  sp,
  page,
  total,
}: {
  base: string;
  sp: SearchParams;
  page: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);
  return (
    <div className="my-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted-foreground">
        {total === 0 ? "No results" : `Showing ${from}-${to} of ${total}`}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" disabled={page <= 1}>
            {page > 1 ? <Link href={hrefFor(base, sp, page - 1)}>← Previous</Link> : <span>← Previous</span>}
          </Button>
          <span className="px-2">
            Page {page} / {pages}
          </span>
          <Button asChild variant="outline" disabled={page >= pages}>
            {page < pages ? <Link href={hrefFor(base, sp, page + 1)}>Next →</Link> : <span>Next →</span>}
          </Button>
        </div>
      )}
    </div>
  );
}
