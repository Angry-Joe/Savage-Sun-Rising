import { SpellPowerSchema, MonsterIndexRowSchema, type SpellPower, type MonsterIndexRow } from "@/schema";
import spellsSample from "../../fixtures/spells-sample.json";
import powersSample from "../../fixtures/powers-sample.json";
import monstersSample from "../../fixtures/monsters-athas-sample.json";

export function loadSpellPowers(): SpellPower[] {
  const rows = [...spellsSample, ...powersSample];
  return rows.map((row) => SpellPowerSchema.parse(row));
}

export function getSpellPower(id: string): SpellPower | undefined {
  return loadSpellPowers().find((p) => p.id === id);
}

export function loadAthasMonsters(): MonsterIndexRow[] {
  return monstersSample.map((row) => MonsterIndexRowSchema.parse(row));
}

export function getMonster(id: string): MonsterIndexRow | undefined {
  return loadAthasMonsters().find((m) => m.id === id);
}

export type SpellPowerFilters = {
  verified?: boolean;
  setting?: string;
  ruleset?: string;
  combatMode?: string;
  q?: string;
};

export function filterSpellPowers(
  items: SpellPower[],
  filters: SpellPowerFilters
): SpellPower[] {
  return items.filter((item) => {
    if (filters.verified !== undefined && item.verified !== filters.verified) {
      return false;
    }
    if (
      filters.setting &&
      !item.allowedCampaignSettings.includes(
        filters.setting as SpellPower["allowedCampaignSettings"][number]
      )
    ) {
      return false;
    }
    if (
      filters.ruleset &&
      !item.allowedRulesets.includes(
        filters.ruleset as SpellPower["allowedRulesets"][number]
      )
    ) {
      return false;
    }
    if (filters.combatMode && item.combatMode !== filters.combatMode) {
      return false;
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = `${item.name} ${item.id} ${item.summary ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
