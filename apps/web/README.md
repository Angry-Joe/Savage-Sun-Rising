# apps/web — Savage Sun Rising product app

Next.js (App Router) + TypeScript read-only browser for Athasian spells, psionics, and monsters. Uses Depp-Magic 3.6 overlay vocabulary.

## Run

From repo root:

1. docker compose up -d
2. cd apps/web
3. Copy .env.example to .env
4. Install Node dependencies
5. Generate Prisma client and push schema
6. Start Next.js in development mode

Open http://localhost:3000

## Layout

- src/schema — Zod character / spell-power / monster types (mirrored in packages/schema)
- fixtures/ — tiny sample JSON only (no full copyrighted corpora)
- prisma/ — Postgres models with JSONB sheets/overlays
- src/app/spells — list + detail with filters
- src/app/monsters — Athas list + detail

## Full corpora (local import later)

Do **not** commit 70k-line spell dumps. For full local import, point tooling at:

- Depp-Magic: Reference/spell-powers-official-v3.6.2.json
- complete-compendium: static/tools/monster_index.json

Sample fixtures under fixtures/ are intentionally tiny placeholders.
