# Savage Sun Rising — target architecture

Production is **self-hosted in the home lab ("the bunker", Proxmox VLAN 326)**.
The database is **MariaDB** running as a system service in the bunker; the app is
Next.js (`apps/web`); authentication is **Authentik as an OIDC provider**.
**No containers in production** (`compose.yaml` holds a dev-only `localdb` profile).

Database setup, grants and the import commands: [DATABASE.md](DATABASE.md).
Auth setup: [AUTH.md](AUTH.md).

---

## The one rule that shapes everything

**Cloudflare Tunnel carries HTTP/HTTPS. It does not carry the MySQL/MariaDB wire
protocol.**

The web app is published through `cloudflared`, like Authentik. The database is never
published to the internet, in any environment. The controls are MariaDB's
`bind-address`, host-scoped `GRANT`s (`'ssr'@'<app host>'`) and the host/pfSense
firewall.

| Component | Dev | Production |
|---|---|---|
| Next.js app | `next dev` on TESLA-GRID | `next start` behind systemd, published via `cloudflared` |
| MariaDB | bunker host, port 3306 open to TESLA-GRID only | bound to localhost (or the app host only) |
| Auth | Authentik OIDC (`/characters` requires sign-in) | Authentik OIDC |

---

## Environments

### 1. Dev — TESLA-GRID

```
TESLA-GRID (10.10.0.215)  ──pfSense LAN rule──►  bunker-host:3306 (MariaDB)
        │                                              │
        └── next dev / prisma / import-corpora.mjs ────┘
```

- MariaDB `bind-address` includes the bunker host's VLAN 326 address.
- The `ssr` account is granted for `'ssr'@'10.10.0.215'` only, not `%`.
- The pfSense **LAN** rule `10.10.0.215 → 192.168.78.0/24 TCP 3306` makes the path
  work (rules evaluate on the interface traffic *enters*). ICMP to 326 fails by
  design — test with `Test-NetConnection bunker-host -Port 3306`, not `ping`.

### 2. Production — bunker

```
internet ──► Cloudflare ──► cloudflared ──► ssr-web (systemd, 127.0.0.1:3000)
                                                │
                                                ├──► mariadb (127.0.0.1:3306)
                                                └──OIDC──► authentik
```

Tighten MariaDB to `bind-address = 127.0.0.1` when the app runs on the same host, and
grant `'ssr'@'localhost'`. If the app runs on a different bunker VM, bind to the VLAN
address and grant only that VM's address.

---

## Data flow

The JSON corpora are the source of truth; the content tables are a rebuildable
artifact. Both corpora repos are **read-only** from this project.

```
Depp-Magic/Reference/spell-powers-official-v3.6*.json ─┐
complete-compendium/static/tools/monster_index.json ───┴─► import-corpora.mjs ─► MariaDB
```

The importer is an idempotent upsert: re-running it updates rows in place, prunes
rows that disappeared from the corpus, records provenance in `corpora`, and never
touches `characters`. In production run it **on the bunker host**.

---

## Authentik OIDC

Implemented in `apps/web` with Auth.js (next-auth v5); see [AUTH.md](AUTH.md).
Redirect URI `${PUBLIC_URL}/api/auth/callback/authentik`. The OIDC `sub` claim
becomes `characters.ownerId`.

---

## Open items

- [ ] Create the MariaDB database and `ssr` account in the bunker
      ([DATABASE.md](DATABASE.md)); `prisma db push`; `npm run db:import`.
- [ ] Create the Authentik provider/application (steps in `docs/AUTH.md`).
- [ ] Decide how `ssr-web` is served in production (systemd unit running
      `next start`, behind the existing cloudflared).
- [ ] Fix quality-flagged rows upstream in Depp-Magic (`spell_new_1788231150919`,
      `spell_new_1788240952303`, `psionic_new_1791364624557`, …; `npm run db:verify`
      lists them).
- [ ] Character creation (template: Depp-Magic `Reference/rules/template_character.json`).
- [ ] 5e ruleset data (the UI already shows a `5e` tab/badge when present).
