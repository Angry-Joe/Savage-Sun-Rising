# Savage Sun Rising

A Dark Sun (Athas) TTRPG reference and character site.

**App:** `apps/web` — Next.js (App Router) + TypeScript + Prisma on **MariaDB**,
Tailwind v4 + shadcn/ui, sign-in via **Authentik** (Auth.js).
**Content:** [Depp-Magic](https://github.com/Angry-Joe/Depp-Magic) (spells/psionics,
3.6 overlay vocabulary) and complete-compendium (monster index), imported read-only.

**Secrets:** never committed. Environment variables / `apps/web/.env` (gitignored) —
see [SECURITY.md](SECURITY.md).

---

## Run

```text
cd apps/web
copy .env.example .env      # set DATABASE_URL + AUTH_* (docs/DATABASE.md, docs/AUTH.md)
npm ci
npx prisma db push
npm run db:import           # spells/psionics + monsters from the corpora repos
npm run dev                 # http://localhost:3000
```

- **Spells** — Wizard/Priest, level, school, ruleset (2e / 2e-rev / 5e), Dark Sun
  overlay, verified; detail tabs per ruleset overlay + the `ds` overlay.
- **Psionic Powers** — discipline, tier, combat mode (N/A | Att | Def),
  prerequisites, PSP costs.
- **Monsters** — Athas by default, all settings on request; statblock detail.
- **My Characters** — requires Authentik sign-in; keyed by the OIDC `sub`.

Docs: [ARCHITECTURE](docs/ARCHITECTURE.md) · [DATABASE](docs/DATABASE.md) ·
[AUTH](docs/AUTH.md)

### Schema

Shared Depp-Magic 3.6 overlay vocabulary lives in `packages/schema` and
`apps/web/src/schema`: `allowedCampaignSettings` / `allowedRulesets`,
`campaignSettings` / `rulesets` overlay bags, codes `ds`, `2e`, `2e-rev`, `5e`,
Depp-Magic ids (`spell_*`, `psionic_*`), and `combatMode` for psionics.

Full corpora are **not** committed; the importer reads them from sibling checkouts.

---

## Project origins

This began as a Master's degree project built as a Blazor/.NET app on cloud
services. That prototype has been removed from the tree; it remains in git history
(last commit containing it: `1ed825e`).

### License

MIT License — see [LICENSE](LICENSE)

Copyright (c) 2026 Angry Joe
