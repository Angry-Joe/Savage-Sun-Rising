import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterField =
  | { kind: "text"; name: string; label: string; value?: string; placeholder?: string }
  | {
      kind: "select";
      name: string;
      label: string;
      value?: string;
      options: { value: string; label: string }[];
    };

/** Plain GET form - filters live in the URL so results are linkable. */
export default function FilterBar({ action, fields }: { action: string; fields: FilterField[] }) {
  return (
    <form method="get" action={action} className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
      {fields.map((f) => (
        <div key={f.name} className="flex min-w-40 flex-col gap-2">
          <Label htmlFor={`f-${f.name}`}>{f.label}</Label>
          {f.kind === "text" ? (
            <Input
              id={`f-${f.name}`}
              name={f.name}
              defaultValue={f.value ?? ""}
              placeholder={f.placeholder}
              className="w-56"
            />
          ) : (
            <Select name={f.name} defaultValue={f.value ?? "any"}>
              <SelectTrigger id={`f-${f.name}`} className="min-w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Button asChild variant="ghost">
          <Link href={action}>Reset</Link>
        </Button>
      </div>
    </form>
  );
}
