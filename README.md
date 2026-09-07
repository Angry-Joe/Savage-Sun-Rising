# Savage Sun Rising

**Product app:** `apps/web` — Next.js (App Router) + TypeScript + Postgres/Prisma.
**Legacy Blazor** master's prototype (`DarkSun.*`) is **deprecated / not used**. See `LEGACY_BLAZOR.md` and `DarkSun.Web/DEPRECATED.md`.
**Depp-Magic** is the content foundry (spell/power overlays, conversion tooling).

Stack constraints for new work: **no** AWS Cognito/DynamoDB, **no** MudBlazor, **no** Blazor dependency for the product app.

---

## How to run (product app)

```text
docker compose up -d
cd apps/web
cp .env.example .env  # macOS/Linux (PowerShell: copy .env.example .env)
# install Node dependencies, then:
#   prisma generate + prisma db push
#   next dev
```

Open http://localhost:3000

- Spells & Powers: list + detail; filters for verified, setting, ruleset, combatMode (N/A | Att | Def)
- Monsters: Athas list + detail (sample `monster_index`-shaped rows)

Postgres is defined in root `docker-compose.yml` (local trust auth). Character sheets / overlays use JSONB via Prisma.

### Full corpora (local import later)

Do **not** commit full copyrighted 70k-line dumps. Tiny fixtures live under `apps/web/fixtures/`.

For full local import later, point tooling at:

- Depp-Magic: `Reference/spell-powers-official-v3.6.2.json`
- complete-compendium: `static/tools/monster_index.json`

### Schema

Shared Depp-Magic 3.6 overlay vocabulary lives in `packages/schema` and `apps/web/src/schema`:

- `allowedCampaignSettings` / `allowedRulesets`
- `campaignSettings` and `rulesets` overlay bags
- codes: `ds`, `2e`, `2e-rev`, `5e`
- spells/powers by Depp-Magic ids (`spell_*`, `psionic_*`)
- `combatMode` for psionics: `N/A` | `Att` | `Def`

---

## Project origins (context)

A Dark Sun (Athas) themed TTRPG character creation and management site. This project began as a Master's degree effort that required heavy use of Microsoft Azure services (including DynamoDB). That cloud dependency is retired in favor of a self-hosted Next.js + PostgreSQL product under `apps/web`.

### Related repositories

- [Depp-Magic](https://github.com/Angry-Joe/Depp-Magic) — content foundry / PDF converter for 2e material and overlay vocabulary.

### License

MIT License — see [LICENSE](LICENSE)

Copyright (c) 2026 Angry Joe
