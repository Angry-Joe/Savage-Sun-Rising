# apps/web — Savage Sun Rising

Next.js (App Router) + TypeScript. Reference browser for Athasian spells, psionics
and monsters, plus signed-in character storage. Prisma on MariaDB; Tailwind v4 +
shadcn/ui; Auth.js + Authentik.

## Run

1. MariaDB reachable and `DATABASE_URL` set — [../../docs/DATABASE.md](../../docs/DATABASE.md)
2. `copy .env.example .env` and fill `DATABASE_URL` + `AUTH_*` ([../../docs/AUTH.md](../../docs/AUTH.md))
3. `npm ci`
4. `npx prisma db push`
5. `npm run db:import` then `npm run db:verify`
6. `npm run dev` → http://localhost:3000

Checks: `npm run typecheck`, `npm run build`.

## Layout

- `prisma/schema.prisma` — MariaDB models (`characters`, `corpora`, `spell_powers`, `monsters`)
- `scripts/import-corpora.mjs` — idempotent corpus upsert; `scripts/verify-import.mjs`
- `src/lib/content.ts` — queries + URL filter parsing for list/detail pages
- `src/app/{spells,powers,monsters}` — lists with filters + detail pages
- `src/app/characters` — signed-in only (middleware + `requireUserId`)
- `src/components/ui` — shadcn/ui components (theme in `src/app/globals.css`)
- `src/schema` — Zod types (mirrored in `packages/schema`)
- `src/auth.ts`, `src/middleware.ts`, `src/app/api/auth` — Auth.js + Authentik
