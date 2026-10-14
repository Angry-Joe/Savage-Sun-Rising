import Link from "next/link";
import type { SpellPower } from "@prisma/client";
import Prose from "@/components/prose";
import {
  ClassBadges,
  CombatModeBadge,
  RulesetBadges,
  SettingBadges,
} from "@/components/content-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Rec = Record<string, unknown>;

const LABELS: Record<string, string> = {
  level: "Level",
  school: "School",
  classes: "Classes",
  spheres: "Spheres",
  sphere: "Sphere",
  range: "Range",
  components: "Components",
  duration: "Duration",
  castingTime: "Casting time",
  areaOfEffect: "Area of effect",
  savingThrow: "Saving throw",
  reversible: "Reversible",
  materialComponent: "Material component",
  concentration: "Concentration",
  ritual: "Ritual",
  higherLevel: "At higher levels",
  discipline: "Discipline",
  tier: "Tier",
  combatMode: "Combat mode",
  prerequisites: "Prerequisite",
  preparationTime: "Preparation time",
  powerScoreStat: "Power score stat",
  powerScoreMod: "Power score modifier",
  initialCost: "Initial cost (PSP)",
  maintenanceCost: "Maintenance cost (PSP)",
  pspCost: "PSP cost",
  pspCostSuccess: "PSP cost (success)",
  pspCostFailure: "PSP cost (failure)",
  mac: "MAC",
  athasianStatus: "Athasian status",
  defilerCost: "Defiler cost",
  sourceBooks: "Source",
  originalSource: "Original source",
};

const SKIP = new Set(["description", "summary", "artworkPrompt", "tags", "relatedEntries"]);

function fmt(key: string, v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.length === 0) return key === "prerequisites" ? "None" : null;
    return v
      .map((x) => {
        if (x && typeof x === "object") {
          const o = x as Rec;
          if (o.name) return o.access ? `${o.name} (${o.access})` : String(o.name);
          if (o.source) return o.page ? `${o.source}, p. ${o.page}` : String(o.source);
          return JSON.stringify(o);
        }
        return String(x);
      })
      .join(", ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function FactTable({ rec, keys }: { rec: Rec; keys?: string[] }) {
  const entries = (keys ?? Object.keys(rec))
    .filter((k) => !SKIP.has(k))
    .map((k) => [k, fmt(k, rec[k])] as const)
    .filter(([, v]) => v !== null);
  if (entries.length === 0) return null;
  return (
    <Table>
      <TableBody>
        {entries.map(([k, v]) => (
          <TableRow key={k}>
            <TableHead className="w-60 align-top font-semibold text-muted-foreground">{LABELS[k] ?? k}</TableHead>
            <TableCell className="whitespace-normal">{v}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const SPELL_KEYS = [
  "level", "school", "classes", "spheres", "sphere", "range", "components", "duration",
  "castingTime", "areaOfEffect", "savingThrow", "reversible", "materialComponent",
  "concentration", "ritual", "higherLevel", "sourceBooks",
];
const POWER_KEYS = [
  "discipline", "tier", "combatMode", "prerequisites", "range", "areaOfEffect",
  "preparationTime", "powerScoreStat", "powerScoreMod", "initialCost", "maintenanceCost",
  "pspCost", "mac", "sourceBooks",
];

const RULESET_LABEL: Record<string, string> = { "2e": "AD&D 2e", "2e-rev": "2e Revised (Complete Psionics)", "5e": "5e" };

export default function SpellPowerDetail({ row }: { row: SpellPower }) {
  const data = (row.data ?? {}) as Rec;
  const rulesets = (data.rulesets ?? {}) as Record<string, Rec>;
  const settings = (data.campaignSettings ?? {}) as Record<string, Rec>;
  const ds = settings.ds;
  const isPower = row.kind === "psionic";
  const back = isPower ? { href: "/powers", label: "Psionic Powers" } : { href: "/spells", label: "Spells" };
  const rulesetKeys = ["2e", "2e-rev", "5e"].filter((k) => rulesets[k] && Object.keys(rulesets[k]).length);
  // Overview: top-level fields win, gaps filled from the first ruleset overlay (prerequisites, PSP costs live there).
  const firstRs = rulesetKeys[0] ? rulesets[rulesetKeys[0]] : {};
  const coreRec: Rec = { ...firstRs };
  for (const [k, v] of Object.entries(data)) if (v !== null && v !== undefined && v !== "") coreRec[k] = v;
  if (Array.isArray(data.prerequisites) && data.prerequisites.length === 0 && firstRs.prerequisites)
    coreRec.prerequisites = firstRs.prerequisites;
  const tabs = [
    { id: "core", label: "Overview" },
    ...rulesetKeys.map((k) => ({ id: `rs-${k}`, label: k })),
    ...(ds ? [{ id: "ds", label: "Dark Sun" }] : []),
  ];

  return (
    <article className="space-y-6">
      <p>
        <Link href={back.href} className="text-ochre">
          ← {back.label}
        </Link>
      </p>
      <header className="space-y-3">
        <h1>{row.name}</h1>
        <div className="flex flex-wrap gap-2">
          {!isPower && row.level !== null && <Badge variant="outline">Level {row.level}</Badge>}
          {isPower && row.discipline && <Badge variant="outline">{row.discipline}</Badge>}
          {isPower && row.tier && <Badge variant="outline">{row.tier}</Badge>}
          <ClassBadges row={row} />
          <RulesetBadges row={row} />
          <SettingBadges row={row} />
          {isPower && <CombatModeBadge mode={row.combatMode} />}
        </div>
        <p className="text-base text-muted-foreground">
          id <code>{row.id}</code>
        </p>
      </header>

      <Tabs defaultValue="core">
        <TabsList className="h-auto flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="px-4 py-2 text-base">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="core" className="space-y-6 pt-4">
          <Card>
            <CardContent>
              <FactTable rec={coreRec} keys={isPower ? POWER_KEYS : SPELL_KEYS} />
            </CardContent>
          </Card>
          <Prose
            text={
              [coreRec.description, ...rulesetKeys.map((k) => rulesets[k].description)].find(
                (d): d is string => typeof d === "string" && d.trim() !== ""
              )
            }
          />
        </TabsContent>

        {rulesetKeys.map((k) => (
          <TabsContent key={k} value={`rs-${k}`} className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{RULESET_LABEL[k] ?? k} overlay</CardTitle>
              </CardHeader>
              <CardContent>
                <FactTable rec={rulesets[k]} />
              </CardContent>
            </Card>
            <Prose text={rulesets[k].description as string | undefined} />
          </TabsContent>
        ))}

        {ds && (
          <TabsContent value="ds" className="space-y-6 pt-4">
            <Card className="border-ember/50">
              <CardHeader>
                <CardTitle className="text-ember">Dark Sun (Athas) overlay</CardTitle>
              </CardHeader>
              <CardContent>
                <FactTable rec={ds} />
              </CardContent>
            </Card>
            {typeof ds.description === "string" && <Prose text={ds.description} />}
          </TabsContent>
        )}
      </Tabs>
    </article>
  );
}
