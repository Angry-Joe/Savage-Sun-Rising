/**
 * Savage Sun Rising — character & content schema
 *
 * Shares Depp-Magic 3.6 overlay vocabulary:
 * - codes: ds | 2e | 2e-rev | 5e
 * - allowedCampaignSettings / allowedRulesets
 * - campaignSettings & rulesets overlay bags
 * - spell_* / psionic_* ids for powers
 * - combatMode for psionics: N/A | Att | Def
 */

import { z } from "zod";

/** Content / ruleset codes used across Depp-Magic overlays and SSR. */
export const ContentCodeSchema = z.enum(["ds", "2e", "2e-rev", "5e"]);
export type ContentCode = z.infer<typeof ContentCodeSchema>;

/** Psionic combat-mode awareness when displaying powers. */
export const CombatModeSchema = z.enum(["N/A", "Att", "Def"]);
export type CombatMode = z.infer<typeof CombatModeSchema>;

/** Opaque overlay bag keyed by content code (Depp-Magic style). */
export const OverlayBagSchema = z.record(z.string(), z.unknown());
export type OverlayBag = z.infer<typeof OverlayBagSchema>;

/** Reference to a Depp-Magic spell or power by stable id. */
export const PowerRefSchema = z.object({
  id: z.string().min(1), // e.g. spell_fireball, psionic_ego_whip
  kind: z.enum(["spell", "psionic"]).optional(),
  name: z.string().optional(),
  combatMode: CombatModeSchema.optional(),
});
export type PowerRef = z.infer<typeof PowerRefSchema>;

/**
 * Character document — product shape for sheets stored as JSONB.
 * Overlay bags hold setting/ruleset-specific deltas without forking the base sheet.
 */
export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  playerName: z.string().optional(),
  level: z.number().int().min(1).max(30).default(1),

  /** Which campaign settings this character is valid for (e.g. ["ds"]). */
  allowedCampaignSettings: z.array(ContentCodeSchema).default([]),
  /** Which rulesets this character may use (e.g. ["2e", "5e"]). */
  allowedRulesets: z.array(ContentCodeSchema).default([]),

  /**
   * Per-setting overlay bags (Depp-Magic vocabulary).
   * Example key: "ds" → Athas-specific race/class tweaks, defiler notes, etc.
   */
  campaignSettings: OverlayBagSchema.default({}),
  /**
   * Per-ruleset overlay bags.
   * Example keys: "2e", "2e-rev", "5e".
   */
  rulesets: OverlayBagSchema.default({}),

  /** Spells / powers known or prepared, referenced by Depp-Magic ids. */
  powers: z.array(PowerRefSchema).default([]),

  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Character = z.infer<typeof CharacterSchema>;

/** Spell / power catalog entry (thin browser; full text lives in Depp-Magic corpora). */
export const SpellPowerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["spell", "psionic"]),
  verified: z.boolean().default(false),
  allowedCampaignSettings: z.array(ContentCodeSchema).default([]),
  allowedRulesets: z.array(ContentCodeSchema).default([]),
  campaignSettings: OverlayBagSchema.default({}),
  rulesets: OverlayBagSchema.default({}),
  /** Required for psionics when combatMode awareness matters in UI. */
  combatMode: CombatModeSchema.default("N/A"),
  level: z.number().int().min(0).max(9).optional(),
  school: z.string().optional(),
  discipline: z.string().optional(),
  summary: z.string().optional(),
});
export type SpellPower = z.infer<typeof SpellPowerSchema>;

/**
 * Monster row shaped like complete-compendium `monster_index` entries
 * (subset used by the Athas browser — not the full corpus).
 */
export const MonsterIndexRowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cr: z.union([z.string(), z.number()]).optional(),
  type: z.string().optional(),
  size: z.string().optional(),
  source: z.string().optional(),
  allowedSettings: z.array(ContentCodeSchema).default([]),
  tags: z.array(z.string()).default([]),
  summary: z.string().optional(),
});
export type MonsterIndexRow = z.infer<typeof MonsterIndexRowSchema>;
