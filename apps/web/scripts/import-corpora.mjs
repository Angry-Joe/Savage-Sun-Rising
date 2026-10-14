#!/usr/bin/env node
/**
 * Import the Savage Sun Rising content corpora into MariaDB (via Prisma).
 *
 *   npm run db:import                       # defaults below / env vars
 *   npm run db:import -- --spells <file> --monsters <file>
 *   npm run db:import -- --dry-run          # parse + report, no writes
 *   npm run db:import -- --no-prune         # keep rows missing from the source
 *
 * Sources (corpora are NOT in this repo):
 *   SSR_SPELLS_FILE   Depp-Magic spells/psionics, schema 3.6.x. Default: the
 *                     newest Reference/spell-powers-official-v3.6*.json in a
 *                     sibling ../Depp-Magic checkout.
 *   SSR_MONSTERS_FILE complete-compendium static/tools/monster_index.json.
 *                     Default: sibling ../complete-compendium checkout.
 *
 * Idempotent: rows are upserted by primary key, so re-running with the same
 * file changes nothing. Rows that disappeared from the source are pruned
 * (content tables are derived data). `characters` is never touched.
 */
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, basename, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : argv[i + 1]
}
const DRY = argv.includes('--dry-run')
const FORCE = argv.includes('--force')
const PRUNE = !argv.includes('--no-prune')
const BATCH = 200

/** Corpus schema versions this importer understands. */
const SUPPORTED_SCHEMA = /^3\.6\./

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..', '..')
const reposDir = resolve(repoRoot, '..')

let prisma = null // lazily constructed; --dry-run needs no Prisma client

// ---------------------------------------------------------------- defaults

/** Newest Reference/spell-powers-official-v3.6*.json in ../Depp-Magic. */
async function defaultSpellsFile() {
  const ref = join(reposDir, 'Depp-Magic', 'Reference')
  if (!existsSync(ref)) return undefined
  const files = (await readdir(ref)).filter((f) => /^spell-powers-official-v3\.6(\.\d+)?\.json$/.test(f))
  const ver = (f) => (f.match(/v(\d+)\.(\d+)(?:\.(\d+))?/) ?? []).slice(1).map((n) => Number(n ?? 0))
  files.sort((a, b) => {
    const [x, y] = [ver(a), ver(b)]
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return y[i] - x[i]
    return 0
  })
  return files[0] ? join(ref, files[0]) : undefined
}

function defaultMonstersFile() {
  const p = join(reposDir, 'complete-compendium', 'static', 'tools', 'monster_index.json')
  return existsSync(p) ? p : undefined
}

// ---------------------------------------------------------------- helpers

const slug = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'unnamed'

const asInt = (v) => {
  const n = typeof v === 'string' ? Number.parseInt(v, 10) : v
  return Number.isFinite(n) ? Math.trunc(n) : null
}
const asFloat = (v) => (Number.isFinite(v) ? v : null)
const arr = (v) => (Array.isArray(v) ? v : [])
const clip = (s, n) => (s == null ? null : String(s).slice(0, n))

const FIELD_LABELS = new Set([
  'components', 'reversible', 'range', 'duration', 'area of effect',
  'casting time', 'saving throw', 'school', 'level', 'sphere', 'spheres',
  'description',
])

/**
 * Flag rows that look like PDF/OCR parser artifacts rather than real entries.
 * Rows are imported either way; nothing is silently dropped.
 */
function suspectFlags(row) {
  const flags = []
  const name = String(row.name ?? '').trim()
  if (FIELD_LABELS.has(name.toLowerCase())) flags.push('field-label-as-name')
  const ocrCase = /[a-z][A-Z]/.test(name) || /[A-Za-z]I[a-z]/.test(name) || /[a-z]I\b/.test(name)
  const ocrPunct = /[A-Za-z][.,][A-Za-z]/.test(name)
  if (ocrCase || ocrPunct) flags.push('ocr-case')
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

function summaryOf(row) {
  if (row.summary) return String(row.summary)
  let text = row.description
  if (!text) {
    for (const o of Object.values(row.rulesets ?? {})) if (o?.description) { text = o.description; break }
  }
  if (!text) return null
  const plain = String(text).replace(/[_*#>`]/g, '').replace(/\s+/g, ' ').trim()
  return plain.length > 240 ? `${plain.slice(0, 237)}…` : plain
}

async function loadJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Corpus file not found: ${path}`)
    throw new Error(`Failed to parse ${path}: ${err.message}`)
  }
}

/** Upsert rows by id in batched transactions; prune ids no longer present. */
async function upsertAll(model, rows, label) {
  const existing = new Set((await model.findMany({ select: { id: true } })).map((r) => r.id))
  let inserted = 0
  let updated = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH)
    await prisma.$transaction(
      chunk.map((r) => {
        const { id, ...rest } = r
        return model.upsert({ where: { id }, create: r, update: rest })
      })
    )
    for (const r of chunk) (existing.has(r.id) ? updated++ : inserted++)
    process.stdout.write(`\r  ${label}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`)
  }
  process.stdout.write('\n')
  let pruned = 0
  if (PRUNE) {
    const keep = new Set(rows.map((r) => r.id))
    const stale = [...existing].filter((id) => !keep.has(id))
    for (let i = 0; i < stale.length; i += 1000) {
      pruned += (await model.deleteMany({ where: { id: { in: stale.slice(i, i + 1000) } } })).count
    }
  }
  return { inserted, updated, pruned }
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

    const classes = arr(r.classes)
    const rulesets = arr(r.allowedRulesets)
    const settings = arr(r.allowedCampaignSettings)
    rows.push({
      id,
      name: clip(r.name ?? '(unnamed)', 255),
      kind,
      tradition: r.tradition ?? (kind === 'psionic' ? 'psionic' : null),
      level: asInt(r.level),
      school: clip(r.school || null, 128),
      discipline: clip(r.discipline || null, 64),
      tier: clip(r.tier || null, 32),
      combatMode: clip(r.combatMode || null, 8),
      classes,
      allowedRulesets: rulesets,
      allowedCampaignSettings: settings,
      isWizard: classes.includes('Wizard'),
      isPriest: classes.includes('Priest'),
      rs2e: rulesets.includes('2e'),
      rs2eRev: rulesets.includes('2e-rev'),
      rs5e: rulesets.includes('5e'),
      csDs: settings.includes('ds'),
      dsOverlay: !!(r.campaignSettings && r.campaignSettings.ds),
      verified: r.verified === true,
      suspect: suspectFlags(r),
      summary: summaryOf(r),
      data: r,
    })
  }

  for (const r of doc.spells ?? []) push(r, 'spell')
  for (const r of doc.psionics ?? []) push(r, 'psionic')
  return { rows, collisions }
}

/** complete-compendium monster_index.json: `rows` with `key`, `sb` statblock, `d` derived. */
function buildMonsters(doc, corpus) {
  const rows = []
  const seen = new Map()
  for (const m of doc.rows ?? doc.monsters ?? []) {
    let id = slug(m.key ?? m.name)
    const n = (seen.get(id) ?? 0) + 1
    seen.set(id, n)
    if (n > 1) id = `${id}-${n}`
    const d = m.d ?? {}
    const settings = arr(m.allowedSettings)
    rows.push({
      id,
      sourceId: asInt(m.id) ?? 0,
      name: clip(m.name ?? m.page ?? '(unnamed)', 255),
      setting: clip(m.set ?? null, 128),
      settingCode: clip(m.acr ?? null, 16),
      isAthas: settings.includes('ds'),
      psionic: m.psi === true,
      hitDice: asFloat(d.hdSort ?? d.hd),
      armorClass: asInt(d.ac),
      xp: asInt(d.xp),
      size: clip(d.sz ?? null, 64),
      corpus,
      data: m,
    })
  }
  return rows
}

// ---------------------------------------------------------------- main

async function main() {
  const SPELLS = arg('spells', process.env.SSR_SPELLS_FILE || (await defaultSpellsFile()))
  const MONSTERS = arg('monsters', process.env.SSR_MONSTERS_FILE || defaultMonstersFile())
  if (!SPELLS && !MONSTERS) {
    throw new Error(
      'Nothing to import. Pass --spells <file> and/or --monsters <file> ' +
      '(or set SSR_SPELLS_FILE / SSR_MONSTERS_FILE).'
    )
  }
  console.log(`Mode : ${DRY ? 'DRY RUN (no writes)' : 'write'}${PRUNE ? '' : ' (no prune)'}\n`)

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
        `Re-run with --force only if you know the shape matches.`
      )
    }
    spellBuild = buildSpellPowers(spellDoc)
    const { rows, collisions } = spellBuild
    const byKind = rows.reduce((a, r) => ((a[r.kind] = (a[r.kind] ?? 0) + 1), a), {})
    const flagged = rows.filter((r) => r.suspect.length > 0)
    console.log(`${path}`)
    console.log(`  schemaVersion   : ${version}  (dateUpdated ${spellDoc.dateUpdated ?? '?'})`)
    console.log(`  rows            : ${rows.length} (${byKind.spell ?? 0} spells, ${byKind.psionic ?? 0} psionics)`)
    console.log(`  verified        : ${rows.filter((r) => r.verified).length}`)
    console.log(`  quality-flagged : ${flagged.length}${flagged.length ? ` - e.g. ${flagged.slice(0, 3).map((r) => r.id).join(', ')}` : ''}`)
    if (collisions.length) {
      console.log(`  ID COLLISIONS   : ${collisions.length} - suffixed with #n. Fix upstream: ${[...new Set(collisions)].slice(0, 5).join(', ')}`)
    }
  }

  if (MONSTERS) {
    const path = resolve(MONSTERS)
    monsterDoc = await loadJson(path)
    monsterRows = buildMonsters(monsterDoc, 'complete-compendium')
    console.log(`${path}`)
    console.log(`  rows            : ${monsterRows.length} (${monsterRows.filter((m) => m.isAthas).length} Athas, ${monsterRows.filter((m) => m.psionic).length} psionic)`)
  }

  console.log()
  if (DRY) {
    console.log('Dry run - nothing written.')
    return
  }

  const { PrismaClient } = await import('@prisma/client')
  prisma = new PrismaClient()

  if (spellBuild) {
    const r = await upsertAll(prisma.spellPower, spellBuild.rows, 'spell_powers')
    console.log(`  spell_powers: +${r.inserted} new, ${r.updated} updated, ${r.pruned} pruned`)
    await prisma.corpus.create({
      data: {
        kind: 'spells',
        sourceFile: clip(resolve(SPELLS), 512),
        schemaVersion: spellDoc.schemaVersion ?? null,
        dateUpdated: spellDoc.dateUpdated ?? null,
        rowCount: spellBuild.rows.length,
        ...r,
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
    const r = await upsertAll(prisma.monster, monsterRows, 'monsters')
    console.log(`  monsters: +${r.inserted} new, ${r.updated} updated, ${r.pruned} pruned`)
    await prisma.corpus.create({
      data: {
        kind: 'monsters',
        sourceFile: clip(resolve(MONSTERS), 512),
        schemaVersion: monsterDoc.schemaVersion ?? null,
        dateUpdated: monsterDoc.editedAt ?? monsterDoc.generated ?? null,
        rowCount: monsterRows.length,
        ...r,
        meta: {
          source: monsterDoc.source ?? null,
          counts: monsterDoc.counts ?? null,
          fieldCodes: monsterDoc.fieldCodes ?? null,
          settingByAcronym: monsterDoc.settingByAcronym ?? null,
        },
      },
    })
  }

  const [sp, ps, mo, ath] = await Promise.all([
    prisma.spellPower.count({ where: { kind: 'spell' } }),
    prisma.spellPower.count({ where: { kind: 'psionic' } }),
    prisma.monster.count(),
    prisma.monster.count({ where: { isAthas: true } }),
  ])
  console.log(`\nDone. spells=${sp} psionics=${ps} monsters=${mo} (athas=${ath})`)
}

main()
  .catch((err) => {
    console.error(`\nImport failed: ${err.message}`)
    process.exitCode = 1
  })
  .finally(() => prisma?.$disconnect())
