// Quick post-import sanity check. Safe to re-run; read-only.
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const [total, spells, psionics, verified, flagged] = await Promise.all([
  p.spellPower.count(),
  p.spellPower.count({ where: { kind: 'spell' } }),
  p.spellPower.count({ where: { kind: 'psionic' } }),
  p.spellPower.count({ where: { verified: true } }),
  p.spellPower.count({ where: { NOT: { suspect: { isEmpty: true } } } }),
])
console.log(`spell_powers  ${total}  (${spells} spells / ${psionics} psionics)`)
console.log(`verified      ${verified}`)
console.log(`flagged       ${flagged}\n`)

console.log('-- curation axis (String[] GIN) --')
for (const code of ['ds', 'xx', 'fr']) {
  const n = await p.spellPower.count({ where: { allowedCampaignSettings: { has: code } } })
  console.log(`  allowedCampaignSettings has '${code}': ${n}`)
}

console.log('\n-- promoted columns --')
const byDiscipline = await p.spellPower.groupBy({
  by: ['discipline'], _count: true,
  where: { kind: 'psionic' }, orderBy: { _count: { discipline: 'desc' } },
})
console.log('  psionics by discipline: ' + byDiscipline.map(d => `${d.discipline}=${d._count}`).join(', '))

const lvl5 = await p.spellPower.count({ where: { kind: 'spell', level: 5, tradition: 'arcane' } })
console.log(`  arcane level-5 spells: ${lvl5}`)

console.log('\n-- JSONB containment (GIN jsonb_path_ops) --')
const rev = await p.$queryRaw`SELECT count(*)::int AS n FROM spell_powers WHERE data @> '{"reversible": true}'`
console.log(`  reversible spells: ${rev[0].n}`)
const overlay = await p.$queryRaw`SELECT count(*)::int AS n FROM spell_powers WHERE data -> 'campaignSettings' ? 'ds'`
console.log(`  rows with a Dark Sun overlay bag: ${overlay[0].n}`)

console.log('\n-- provenance --')
const corpora = await p.corpus.findMany({ orderBy: { importedAt: 'desc' } })
for (const c of corpora) {
  console.log(`  ${c.kind}: ${c.rowCount} rows, schema ${c.schemaVersion ?? 'n/a'} (${c.dateUpdated ?? 'n/a'})`)
}

console.log('\n-- the 2 flagged rows --')
const bad = await p.spellPower.findMany({
  where: { NOT: { suspect: { isEmpty: true } } },
  select: { id: true, suspect: true },
})
for (const b of bad) console.log(`  ${b.id}  [${b.suspect.join(', ')}]`)

await p.$disconnect()
