import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const PAGE_SIZE = 50;

export type SearchParams = Record<string, string | string[] | undefined>;

export function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() !== "" && s !== "any" ? s.trim() : undefined;
}

export function pageOf(sp: SearchParams): number {
  const n = Number.parseInt(first(sp.page) ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Runs a DB query and turns connection failures into a friendly message. */
export async function safe<T>(
  fn: () => Promise<T>
): Promise<{ ok: true; data: T; error: null } | { ok: false; data: null; error: string }> {
  try {
    return { ok: true, data: await fn(), error: null };
  } catch (err) {
    console.error("[db]", err);
    return {
      ok: false,
      data: null,
      error:
        "The content database is not reachable. Check DATABASE_URL and that MariaDB is running (see docs/DATABASE.md).",
    };
  }
}

// ------------------------------------------------------------- spells

export type SpellFilters = {
  q?: string;
  cls?: "Wizard" | "Priest";
  level?: number;
  school?: string;
  ruleset?: "2e" | "2e-rev" | "5e";
  ds?: boolean;
  verified?: boolean;
};

export function spellFiltersFrom(sp: SearchParams): SpellFilters {
  const cls = first(sp.class);
  const ruleset = first(sp.ruleset);
  const level = Number.parseInt(first(sp.level) ?? "", 10);
  return {
    q: first(sp.q),
    cls: cls === "Wizard" || cls === "Priest" ? cls : undefined,
    level: Number.isFinite(level) ? level : undefined,
    school: first(sp.school),
    ruleset: ruleset === "2e" || ruleset === "2e-rev" || ruleset === "5e" ? ruleset : undefined,
    ds: first(sp.ds) === "1" ? true : undefined,
    verified: first(sp.verified) === "1" ? true : undefined,
  };
}

function rulesetWhere(r?: string): Prisma.SpellPowerWhereInput {
  if (r === "2e") return { rs2e: true };
  if (r === "2e-rev") return { rs2eRev: true };
  if (r === "5e") return { rs5e: true };
  return {};
}

export async function listSpells(f: SpellFilters, page: number) {
  // utf8mb4_unicode_ci makes `contains` case-insensitive on MariaDB.
  const where: Prisma.SpellPowerWhereInput = {
    kind: "spell",
    ...(f.q ? { name: { contains: f.q } } : {}),
    ...(f.cls === "Wizard" ? { isWizard: true } : {}),
    ...(f.cls === "Priest" ? { isPriest: true } : {}),
    ...(f.level !== undefined ? { level: f.level } : {}),
    ...(f.school ? { school: { contains: f.school } } : {}),
    ...rulesetWhere(f.ruleset),
    ...(f.ds ? { csDs: true } : {}),
    ...(f.verified ? { verified: true } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.spellPower.count({ where }),
    prisma.spellPower.findMany({
      where,
      orderBy: [{ name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: listSelect,
    }),
  ]);
  return { total, rows };
}

// ------------------------------------------------------------- powers

export type PowerFilters = {
  q?: string;
  discipline?: string;
  tier?: string;
  combatMode?: "N/A" | "Att" | "Def";
  ruleset?: "2e" | "2e-rev" | "5e";
};

export const DISCIPLINES = [
  "Clairsentience",
  "Psychokinesis",
  "Psychometabolism",
  "Psychoportation",
  "Telepathy",
  "Metapsionics",
] as const;
export const TIERS = ["Science", "Devotion", "High Science"] as const;

export function powerFiltersFrom(sp: SearchParams): PowerFilters {
  const mode = first(sp.combatMode);
  const ruleset = first(sp.ruleset);
  return {
    q: first(sp.q),
    discipline: first(sp.discipline),
    tier: first(sp.tier),
    combatMode: mode === "N/A" || mode === "Att" || mode === "Def" ? mode : undefined,
    ruleset: ruleset === "2e" || ruleset === "2e-rev" || ruleset === "5e" ? ruleset : undefined,
  };
}

export async function listPowers(f: PowerFilters, page: number) {
  const where: Prisma.SpellPowerWhereInput = {
    kind: "psionic",
    ...(f.q ? { name: { contains: f.q } } : {}),
    ...(f.discipline ? { discipline: f.discipline } : {}),
    ...(f.tier ? { tier: f.tier } : {}),
    ...(f.combatMode ? { combatMode: f.combatMode } : {}),
    ...rulesetWhere(f.ruleset),
  };
  const [total, rows] = await Promise.all([
    prisma.spellPower.count({ where }),
    prisma.spellPower.findMany({
      where,
      orderBy: [{ discipline: "asc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: listSelect,
    }),
  ]);
  return { total, rows };
}

const listSelect = {
  id: true,
  name: true,
  kind: true,
  level: true,
  school: true,
  discipline: true,
  tier: true,
  combatMode: true,
  isWizard: true,
  isPriest: true,
  rs2e: true,
  rs2eRev: true,
  rs5e: true,
  csDs: true,
  dsOverlay: true,
  verified: true,
  summary: true,
} satisfies Prisma.SpellPowerSelect;

export type SpellPowerListRow = Prisma.SpellPowerGetPayload<{ select: typeof listSelect }>;

export function getSpellPower(id: string) {
  return prisma.spellPower.findUnique({ where: { id } });
}

// ------------------------------------------------------------- monsters

export type MonsterFilters = { q?: string; all?: boolean; psionic?: boolean };

export function monsterFiltersFrom(sp: SearchParams): MonsterFilters {
  return {
    q: first(sp.q),
    all: first(sp.all) === "1" ? true : undefined,
    psionic: first(sp.psionic) === "1" ? true : undefined,
  };
}

export async function listMonsters(f: MonsterFilters, page: number) {
  const where: Prisma.MonsterWhereInput = {
    ...(f.all ? {} : { isAthas: true }),
    ...(f.q ? { name: { contains: f.q } } : {}),
    ...(f.psionic ? { psionic: true } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.monster.count({ where }),
    prisma.monster.findMany({
      where,
      orderBy: [{ name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        setting: true,
        settingCode: true,
        isAthas: true,
        psionic: true,
        hitDice: true,
        armorClass: true,
        xp: true,
        size: true,
      },
    }),
  ]);
  return { total, rows };
}

export function getMonster(id: string) {
  return prisma.monster.findUnique({ where: { id } });
}

export async function contentCounts() {
  const [spells, powers, monsters, athas] = await Promise.all([
    prisma.spellPower.count({ where: { kind: "spell" } }),
    prisma.spellPower.count({ where: { kind: "psionic" } }),
    prisma.monster.count(),
    prisma.monster.count({ where: { isAthas: true } }),
  ]);
  return { spells, powers, monsters, athas };
}

/** complete-compendium statblock field codes (monster_index.json `fieldCodes`). */
export const MONSTER_FIELDS: Record<string, string> = {
  ct: "Climate/Terrain",
  fr: "Frequency",
  org: "Organization",
  cyc: "Activity Cycle",
  dt: "Diet",
  int: "Intelligence",
  tr: "Treasure",
  al: "Alignment",
  na: "No. Appearing",
  ac: "Armor Class",
  mv: "Movement",
  hd: "Hit Dice",
  th: "THAC0",
  noa: "No. of Attacks",
  dmg: "Damage/Attack",
  sa: "Special Attacks",
  sd: "Special Defenses",
  mr: "Magic Resistance",
  sz: "Size",
  mor: "Morale",
  xp: "XP Value",
};
