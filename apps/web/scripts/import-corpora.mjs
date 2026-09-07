#!/usr/bin/env node
/**
 * Import the Savage Sun Rising content corpora into Postgres.
 *
 * Corpora are NOT in this repo (copyrighted source dumps). Point the flags at
 * the real files:
 *
 *   node scripts/import-corpora.mjs \
 *     --spells   "C:\\jdlcode\\repos\\Depp-Magic\\Reference\\spell-powers-v3.6.2.json" \
 *     --monsters "C:\\jdlcode\\Claude\\SavageSun\\monsters.json"
 *
 *   node scripts/import-corpora.mjs --spells ... --dry-run
 *
 * Env fallbacks: SSR_SPELLS_FILE, SSR_MONSTERS_FILE.
 *
 * Idempotent: content tables are truncated and rebuilt. `characters` is never
 * touched. The JSON files stay the source of truth; the database is a
 * rebuildable artifact — re-run after every corpus edit.
 */
import { readFile } from 'node:fs/promises'
import { resolve, basename } from 'node:path'

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : argv[i + 1]
}

const SPELLS = arg('spells', process.env.SSR_SPELLS_FILE)
const MONSTERS = arg('monsters', process.env.SSR_MONSTERS_FILE)
const DRY = argv.includes('--dry-run')
const FORCE = argv.includes('--force')
const CHUNK = 500

/** Corpus schema versions this importer understands. */
const SUPPORTED_SCHEMA = /^3\.6\./

let prisma = null // lazily constructed; --dry-run needs no Prisma client

// ---------------------------------------------------------------- helpers

const slug = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'unnamed'

const asInt = (v) => (Number.isFinite(v) ? v : null)

const FIELD_LABELS = new Set([
  'components', 'reversible', 'range', 'duration', 'area of effect',
  'casting time', 'saving throw', 'school', 'level', 'sphere', 'spheres',
  'description',
])

/**
 * Flag rows that look like PDF/OCR parser artifacts rather than real entries.
 * v3.6.2 is clean, but the corpus is regenerated from PDFs — this is the
 * tripwire for the next regeneration, not dead code.
 * Rows are imported either way; nothing is silently dropped.
 */
function suspectFlags(row) {
  const flags = []
  const name = String(row.name ?? '').trim()
  if (FIELD_LABELS.has(name.toLowerCase())) flags.push('field-label-as-name')

  // Intra-word case damage only. A word that simply *starts* with a capital
  // letter is normal English ("Advanced Illusion", "Bigby's Interposing Hand")
  // and must not be flagged.
  //   [a-z][A-Z]      EntAngle, WhIsperIng, AuSUfY
  //   [A-Za-z]I[a-z]  capital I standing in for l/i mid-word
  //   [a-z]I\b        SlglI
  const ocrCase = /[a-z][A-Z]/.test(name) || /[A-Za-z]I[a-z]/.test(name) || /[a-z]I\b/.test(name)
  // Scanner noise substituting punctuation for letters: Loc.te, Nes.dve
  const ocrPunct = /[A-Za-z][.,][A-Za-z]/.test(name)
  if (ocrCase || ocrPunct) flags.push('ocr-case')

  // v3.6 keeps psionic prose in the ruleset overlay bag (rulesets['2e']
  // .description), not at the top level — look in both before flagging.
  if (!hasDescription(row)) flags.push('no-description')

  if (name.length < 3) flags.push('short-name')
  return flags
}

/** True if the record carries prose anywhere: top level or an overlay bag. */
function hasDescription(row) {
  if (row.description) return true
  for (const bag of [row.rulesets, row.campaignSettings]) {
    for (const overlay of Object.values(bag ?? {})) {
      if (overlay && overlay.description) return true
    }
  }
  return false
}

async function loadJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Corpus file not found: ${path}`)
    throw new Error(`Failed to parse ${path}: ${err.message}`)
  }
}

async function insertChunked(model, rows, label) {
  let done = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    await model.createMany({ data: rows.slice(i, i + CHUNK), skipDuplicates: true })
    done += Math.min(CHUNK, rows.length - i)
    process.stdout.write(`\r  ${label}: ${done}/${rows.length}`)
  }
  process.stdout.write('\n')
}

// ---------------------------------------------------------------- builders

/** Depp-Magic v3.6: two arrays, `spells` and `psionics`, ids unique across both. */
function buildSpellPowers(doc) {
  const rows = []
  const seen = new Set()
  const collisions = []

  const push = (r, kind) => {
    let id = r.id ?? `${kind}_${slug(r.name)}`
    if (seen.has(id)) {
      collisions.push(id)
      let n = 2
      while (seen.has(`${id}#${n}`)) n += 1
      id = `${id}#${n}`
    }
    seen.add(id)

    rows.push({
      id,
      name: r.name ?? '(unnamed)',
      kind,
      tradition: r.tradition ?? (kind === 'psionic' ? 'psionic' : null),
      level: asInt(r.level),
      school: r.school ?? null,
      classes: Array.isArray(r.classes) ? r.classes : [],
      discipline: r.discipline ?? null,
      tier: r.tier ?? null,
      combatMode: r.combatMode ?? null,
      allowedRulesets: Array.isArray(r.allowedRulesets) ? r.allowedRulesets : [],
      allowedCampaignSettings: Array.isArray(r.allowedCampaignSettings)
        ? r.allowedCampaignSettings
        : [],
      verified: r.verified === true,
      suspect: suspectFlags(r),
      data: r,
    })
  }

  for (const r of doc.spells ?? []) push(r, 'spell')
  for (const r of doc.psionics ?? []) push(r, 'psionic')

  return { rows, collisions }
}

function buildMonsters(doc, corpus) {
  const rows = []
  const seen = new Map()

  for (const m of doc.monsters ?? []) {
    let id = slug(m.name)
    const n = (seen.get(id) ?? 0) + 1
    seen.set(id, n)
    if (n > 1) id = `${id}-${n}`

    rows.push({
      id,
      name: m.name ?? '(unnamed)',
      corpus,
      multiVariant: m.multi_variant === true,
      data: m,
    })
  }
  return rows
}

// ---------------------------------------------------------------- main

async function main() {
  if (!SPELLS && !MONSTERS) {
    throw new Error(
      'Nothing to import. Pass --spells <file> and/or --monsters <file> ' +
      '(or set SSR_SPELLS_FILE / SSR_MONSTERS_FILE).'
    )
  }
  console.log(`Mode : ${DRY ? 'DRY RUN (no writes)' : 'write'}\n`)

  let spellDoc = null
  let spellBuild = null
  let monsterDoc = null
  let monsterRows = null

  if (SPELLS) {
    const path = resolve(SPELLS)
    spellDoc = await loadJson(path)

    const version = spellDoc.schemaVersion ?? '(none)'
    if (!SUPPORTED_SCHEMA.test(version) && !FORCE) {
      throw new Error(
        `${basename(path)} is schemaVersion ${version}; this importer targets 3.6.x. ` +
        `The v2 shape (flat "spells" array, non-unique ids) is not compatible. ` +
        `Re-run with --force only if you know the shape matches.`
      )
    }

    spellBuild = buildSpellPowers(spellDoc)
    const { rows, collisions } = spellBuild
    const byKind = rows.reduce((a, r) => ((a[r.kind] = (a[r.kind] ?? 0) + 1), a), {})
    const flagged = rows.filter((r) => r.suspect.length > 0)

    console.log(`${basename(path)}`)
    console.log(`  schemaVersion   : ${version}  (dateUpdated ${spellDoc.dateUpdated ?? '?'})`)
    console.log(`  rows            : ${rows.length} (${byKind.spell ?? 0} spells, ${byKind.psionic ?? 0} psionics)`)
    console.log(`  verified        : ${rows.filter((r) => r.verified).length}`)
    console.log(`  quality-flagged : ${flagged.length}${flagged.length ? ` — e.g. ${flagged.slice(0, 3).map((r) => r.name).join(', ')}` : ''}`)
    if (collisions.length) {
      console.log(`  ID COLLISIONS   : ${collisions.length} — suffixed with #n. Fix upstream: ${[...new Set(collisions)].slice(0, 5).join(', ')}`)
    }
  }

  if (MONSTERS) {
    const path = resolve(MONSTERS)
    monsterDoc = await loadJson(path)
    monsterRows = buildMonsters(monsterDoc, 'mc12')
    console.log(`${basename(path)}`)
    console.log(`  rows            : ${monsterRows.length} (${monsterRows.filter((m) => m.multiVariant).length} multi-variant)`)
  }

  console.log()
  if (DRY) {
    console.log('Dry run — nothing written.')
    return
  }

  const { PrismaClient } = await import('@prisma/client')
  prisma = new PrismaClient()

  // Content tables are derived data: wipe and rebuild. `characters` is user
  // data and is deliberately left alone.
  if (spellBuild) await prisma.spellPower.deleteMany({})
  if (monsterRows) await prisma.monster.deleteMany({})

  if (spellBuild) {
    await insertChunked(prisma.spellPower, spellBuild.rows, 'spell_powers')
    await prisma.corpus.create({
      data: {
        kind: 'spells',
        sourceFile: resolve(SPELLS),
        schemaVersion: spellDoc.schemaVersion ?? null,
        dateUpdated: spellDoc.dateUpdated ?? null,
        rowCount: spellBuild.rows.length,
        meta: {
          rulesets: spellDoc.rulesets ?? [],
          campaignSettings: spellDoc.campaignSettings ?? [],
          spells: (spellDoc.spells ?? []).length,
          psionics: (spellDoc.psionics ?? []).length,
          idCollisions: spellBuild.collisions.length,
        },
      },
    })
  }

  if (monsterRows) {
    await insertChunked(prisma.monster, monsterRows, 'monsters')
    await prisma.corpus.create({
      data: {
        kind: 'monsters',
        sourceFile: resolve(MONSTERS),
        schemaVersion: null,
        dateUpdated: null,
        rowCount: monsterRows.length,
        meta: { title: monsterDoc.title ?? null, source: monsterDoc.source ?? null },
      },
    })
  }

  const [sp, mo] = await Promise.all([
    prisma.spellPower.count(),
    prisma.monster.count(),
  ])
  console.log(`\nDone. spell_powers=${sp} monsters=${mo}`)
}

main()
  .catch((err) => {
    console.error(`\nImport failed: ${err.message}`)
    process.exitCode = 1
  })
  .finally(() => prisma?.$disconnect())
