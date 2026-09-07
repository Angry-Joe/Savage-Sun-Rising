# Savage Sun Rising — target architecture

Decided 2026-09-07. Production is **self-hosted on Proxmox (VLAN 326)**; Azure is a
separate, parallel deployment built only when the Master's project needs it.
Authentication is **Authentik as an OIDC provider**. **No containers** — Postgres runs
as a system service on the VM.

---

## The one rule that shapes everything

**Cloudflare Tunnel carries HTTP/HTTPS. It does not carry the Postgres wire protocol.**

"Reachable like Authentik" is the right goal for the *web app* and the wrong goal for
the *database*. Authentik is published because `cloudflared` fronts HTTP to it. The
database is never published to the internet, in any environment.

What replaces container network isolation is `listen_addresses` + `pg_hba.conf` +
the host firewall. Those are the real controls; Docker was only ever wrapping them.

| Component | Dev | Production |
|---|---|---|
| Next.js app | `next dev` on TESLA-GRID | `next start` behind systemd, published via `cloudflared` |
| Postgres | listening on the VLAN 326 address | listening on **localhost only** |
| Auth | none | Authentik OIDC |

---

## Environments

### 1. Dev — Visual Studio on TESLA-GRID

```
TESLA-GRID (10.10.0.215)  ──pfSense LAN rule──►  192.168.78.136:5432
        │                                              │
        └── next dev / prisma / import-corpora.mjs ────┘
```

`postgresql.conf`

```conf
listen_addresses = 'localhost,192.168.78.136'
```

`pg_hba.conf` — one line, scoped to the workstation, not the whole subnet:

```conf
# TYPE  DATABASE             USER  ADDRESS           METHOD
host    savage_sun_rising    ssr   10.10.0.215/32    scram-sha-256
```

Reload with `sudo systemctl reload postgresql`. `pg_hba.conf` is evaluated
top-to-bottom, first match wins — put this above any broader `reject`.

The pfSense **LAN** rule `10.10.0.215 → 192.168.78.0/24 TCP` is what makes the path
work. Rules evaluate on the interface traffic *enters*; a rule on the BNKR tab governs
traffic leaving 326 and can never match inbound. ICMP needs its own rule — ping to 326
fails by design, so test with `Test-NetConnection`, not `ping`.

Auth is bypassed in dev. `characters.ownerId` is nullable for exactly this reason.

### 2. Production — bnkr-bunsen01, VLAN 326

```
internet ──► Cloudflare ──► cloudflared ──► ssr-web (systemd, 127.0.0.1:3000)
                                                │
                                                ├──► postgres (127.0.0.1:5432)
                                                └──OIDC──► authentik
```

Tighten Postgres back down:

```conf
listen_addresses = 'localhost'
```

The app connects over loopback (or the Unix socket, which is faster and needs no
password):

```
DATABASE_URL="postgresql://ssr@localhost/savage_sun_rising?host=/var/run/postgresql&schema=public"
```

Nothing outside the host can open a socket to the database — the same posture
Authentik's own database has.

### 3. Azure — Master's project only

The portability claim, stated precisely: **only `DATABASE_URL` and the TLS mode
change.** No schema change, no importer change.

```
Azure App Service / Container Apps ──► Azure Database for PostgreSQL Flexible Server
                                        (private endpoint, sslmode=require)
```

```
postgresql://ssr:PASS@ssr-pg.postgres.database.azure.com:5432/savage_sun_rising?sslmode=require
```

Flexible Server is the same engine, so `jsonb`, GIN indexes and `String[]` columns
behave identically. That equivalence is the demonstrable result for the write-up —
build it as a second target, not a migration.

---

## Installing Postgres on bnkr-bunsen01

Host port 5432 is free: Authentik's database is inside its container stack and is not
published.

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql <<'SQL'
CREATE ROLE ssr LOGIN PASSWORD 'CHANGEME';
CREATE DATABASE savage_sun_rising OWNER ssr;
\c savage_sun_rising
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SQL
```

Config lives in `/etc/postgresql/<version>/main/`. Apply the `listen_addresses` and
`pg_hba.conf` entries above, then `sudo systemctl reload postgresql`.

`pg_trgm` is worth having for fuzzy spell/creature name search. `jsonb` and GIN are
core — nothing to install.

Backups are now your job rather than a volume snapshot:

```bash
pg_dump -Fc savage_sun_rising > savage_sun_rising_$(date +%F).dump
```

---

## Data flow

The JSON corpora are the source of truth; the database is a rebuildable artifact.

```
Depp-Magic/Reference/spell-powers-v3.6.2.json ─┐
SavageSun/monsters.json ───────────────────────┴─► import-corpora.mjs ─► Postgres
```

Re-run the importer after every corpus edit. It truncates `spell_powers` and
`monsters` and rebuilds them, and never touches `characters`. In production, run it
**on the host** — not from a workstation across the network.

---

## Authentik OIDC

Authentik already runs here, so the app becomes an OIDC client rather than growing its
own password handling.

In Authentik: create an **OAuth2/OpenID Provider** and an **Application**, redirect URI
`${PUBLIC_URL}/api/auth/callback/authentik`.

Two URLs, and mixing them up is the usual failure:

- **Issuer / token exchange** — server-to-server, reachable from the app host.
- **Authorize / redirect** — what the *browser* is sent to, so it must be the public
  hostname.

The OIDC `sub` claim becomes `characters.ownerId`. It is `String?` today; make it
required once the provider is live and existing rows are backfilled.

---

## Open items

- [ ] Install Postgres on bnkr-bunsen01, create the role and database, apply
      `listen_addresses` + `pg_hba.conf`.
- [ ] Run `prisma db push` and the corpus import against it.
- [ ] Create the Authentik provider/application.
- [ ] Decide how `ssr-web` is served in production (systemd unit running
      `next start`, behind the existing cloudflared).
- [ ] Delete `spell_new_1788231150919` / `spell_new_1788240952303` upstream in
      Depp-Magic.
- [ ] Legacy `Dockerfile` and `Run-Docker.ps1` at the repo root belong to the
      deprecated Blazor app — left in place, remove with the rest of `DarkSun.*`.
