import { Badge } from "@/components/ui/badge";
import type { SpellPowerListRow } from "@/lib/content";

type Flags = Pick<
  SpellPowerListRow,
  "isWizard" | "isPriest" | "rs2e" | "rs2eRev" | "rs5e" | "csDs" | "dsOverlay" | "verified" | "combatMode" | "kind"
>;

export function ClassBadges({ row }: { row: Flags }) {
  return (
    <>
      {row.isWizard && <Badge className="bg-secondary text-parchment">Wizard</Badge>}
      {row.isPriest && <Badge className="bg-secondary text-parchment">Priest</Badge>}
    </>
  );
}

export function RulesetBadges({ row }: { row: Flags }) {
  return (
    <>
      {row.rs2e && <Badge variant="outline">2e</Badge>}
      {row.rs2eRev && <Badge variant="outline">2e-rev</Badge>}
      {row.rs5e && <Badge variant="outline">5e</Badge>}
    </>
  );
}

export function SettingBadges({ row }: { row: Flags }) {
  return (
    <>
      {row.csDs && (
        <Badge className="border-ember/60 bg-ember/15 text-ember" title={row.dsOverlay ? "Dark Sun overlay present" : "Allowed on Athas"}>
          Dark Sun{row.dsOverlay ? " ✦" : ""}
        </Badge>
      )}
      {row.verified && <Badge className="border-sick/60 bg-sick/15 text-sick">verified</Badge>}
    </>
  );
}

export function CombatModeBadge({ mode }: { mode: string | null }) {
  if (!mode) return null;
  const tone =
    mode === "Att"
      ? "border-destructive/60 bg-destructive/15 text-destructive"
      : mode === "Def"
        ? "border-sick/60 bg-sick/15 text-sick"
        : "text-muted-foreground";
  return (
    <Badge variant="outline" className={tone} title="Psionic combat mode">
      {mode === "N/A" ? "non-combat" : mode === "Att" ? "Attack mode" : "Defense mode"}
    </Badge>
  );
}
