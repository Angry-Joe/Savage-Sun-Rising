// Quick post-import sanity check against MariaDB. Safe to re-run; read-only.
//   npm run db:verify
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const [total, spells, psionics, verified, wizard, priest, ds, rev2e] = await Promise.all([
  p.spellPower.count(),
  p.spellPower.count({ where: { kind: 'spell' } }),
  p.spellPower.count({ where: { kind: 'psionic' } }),
  p.spellPower.count({ where: { verified: true } }),
  p.spellPower.count({ where: { isWizard: true } }),
  p.spellPower.count({ where: { isPriest: true } }),
  p.spellPower.count({ where: { csDs: true } }),
  p.spellPower.count({ where: { rs2eRev: true } }),
])
console.log(`spell_powers  ${total}  (${spells} spells / ${psionics} psionics)`)
console.log(`verified      ${verified}`)
console.log(`Wizard ${wizard} / Priest ${priest} / ds ${ds} / 2e-rev ${rev2e}`)

const byDiscipline = await p.spellPower.groupBy({
  by: ['discipline'], _count: { _all: true }, where: { kind: 'psionic' },
})
console.log('psionics by discipline: ' + byDiscipline.map((d) => `${d.discipline}=${d._count._all}`).join(', '))

const byMode = await p.spellPower.groupBy({
  by: ['combatMode'], _count: { _all: true }, where: { kind: 'psionic' },
})
console.log('psionics by combatMode: ' + byMode.map((d) => `${d.combatMode}=${d._count._all}`).join(', '))

// JSON functions work on MariaDB's JSON (LONGTEXT + json_valid) columns.
// Note: MariaDB's JSON_VALUE returns booleans as '1'/'0' (MySQL: 'true'/'false').
const [rev] = await p.$queryRaw`SELECT COUNT(*) AS n FROM spell_powers WHERE JSON_VALUE(data, '$.reversible') IN ('1', 'true')`
console.log(`reversible spells: ${Number(rev.n)}`)
const [flagged] = await p.$queryRaw`SELECT COUNT(*) AS n FROM spell_powers WHERE JSON_LENGTH(suspect) > 0`
console.log(`quality-flagged rows: ${Number(flagged.n)}`)

const [monsters, athas] = await Promise.all([
  p.monster.count(),
  p.monster.count({ where: { isAthas: true } }),
])
console.log(`monsters      ${monsters}  (${athas} Athas)`)

console.log('\n-- provenance (latest first) --')
const corpora = await p.corpus.findMany({ orderBy: { importedAt: 'desc' }, take: 4 })
for (const c of corpora) {
  console.log(`  ${c.importedAt.toISOString()} ${c.kind}: ${c.rowCount} rows (+${c.inserted}/~${c.updated}/-${c.pruned}), schema ${c.schemaVersion ?? 'n/a'}`)
}

await p.$disconnect()
