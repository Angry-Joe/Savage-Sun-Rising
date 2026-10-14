# Database — MariaDB in the bunker

`apps/web` uses Prisma's built-in **`mysql`** provider, which officially supports
MariaDB (tested here with MariaDB 11.8). No driver adapter is needed.

## 1. Create the database and account (once, as root on the bunker host)

```sql
-- Set charset/collation explicitly: MariaDB 11.x otherwise defaults to
-- utf8mb4_uca1400_ai_ci.
CREATE DATABASE savage_sun_rising
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- One account per client host. Dev: TESLA-GRID. Prod: 'localhost' (same host)
-- or the app VM's address. Never '%'.
CREATE USER 'ssr'@'10.10.0.215' IDENTIFIED BY '<strong password>';
CREATE USER 'ssr'@'localhost'   IDENTIFIED BY '<strong password>';

-- Prisma `db push` needs DDL rights on this one database only.
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
  ON savage_sun_rising.* TO 'ssr'@'10.10.0.215';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
  ON savage_sun_rising.* TO 'ssr'@'localhost';
FLUSH PRIVILEGES;
```

Server config (e.g. `/etc/mysql/mariadb.conf.d/50-server.cnf`):

```ini
[mysqld]
# Dev: bunker VLAN address so TESLA-GRID can reach it. Prod: 127.0.0.1.
bind-address = 127.0.0.1
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

Restart (`sudo systemctl restart mariadb`) and open 3306 on the host firewall only
for the app host / TESLA-GRID. Never publish 3306 through cloudflared.

## 2. Environment (`apps/web/.env`, gitignored)

```env
DATABASE_URL="mysql://ssr:<password>@bunker-host:3306/savage_sun_rising"
# Optional; defaults resolve to sibling checkouts of the corpora repos:
SSR_SPELLS_FILE="…/Depp-Magic/Reference/spell-powers-official-v3.6.2.json"
SSR_MONSTERS_FILE="…/complete-compendium/static/tools/monster_index.json"
```

URL-encode special characters in the password (`@` → `%40`, `:` → `%3A`, …).

## 3. Schema, import, verify

```bash
cd apps/web
npm ci
npx prisma db push      # creates/updates characters, corpora, spell_powers, monsters
npm run db:import       # idempotent upsert of both corpora (prunes removed rows)
npm run db:verify       # counts, breakdowns, quality-flagged rows
```

Importer flags: `--spells <file>`, `--monsters <file>`, `--dry-run`, `--no-prune`,
`--force`. Spells default to the newest `spell-powers-official-v3.6*.json` in
`../Depp-Magic/Reference` (relative to the folder holding this repo). Pull
Depp-Magic / complete-compendium first; they are read-only from here. The monster
index currently lives on complete-compendium's `editor-page` branch.

Expected counts with Depp-Magic v3.6.2 + the current monster index: 1049 spells
(578 Wizard / 471 Priest), 219 psionic powers, 3509 monsters (403 Athas).

Backups: `mariadb-dump --single-transaction savage_sun_rising > ssr_$(date +%F).sql`.
Only `characters` is irreplaceable; content tables can be re-imported.

## MariaDB notes / caveats

- **JSON** columns are `LONGTEXT` + `CHECK (json_valid(...))` in MariaDB. Prisma
  reads/writes them as JSON normally; raw SQL should use `JSON_VALUE` /
  `JSON_EXTRACT`. `JSON_VALUE` returns booleans as `'1'`/`'0'` (MySQL returns
  `'true'`), so compare with `IN ('1','true')`.
- No array columns or GIN indexes: the filterable bits (Wizard/Priest, 2e/2e-rev/5e,
  Dark Sun, verified) are promoted to indexed boolean columns at import time; the
  full Depp-Magic record stays in `data`.
- Text search uses `contains` → `LIKE`, case-insensitive via `utf8mb4_unicode_ci`
  (Prisma's `mode: "insensitive"` is not available on mysql).
- Primary keys are `VARCHAR(191)`; every index fits InnoDB's 3072-byte key limit
  under utf8mb4 (4 bytes/char).
- Local dev without the bunker: `docker compose --profile localdb up -d` (repo root)
  starts a throwaway MariaDB 11.8 on 127.0.0.1:3306; it is not started by default.
