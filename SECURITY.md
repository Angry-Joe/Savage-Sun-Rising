# Security & secrets

**Secrets are never committed to this repository** — not in `.env`, scripts,
workflows or docs.

| Code | Source of secrets |
| --- | --- |
| `apps/web` (Next.js) | Environment variables, or `apps/web/.env` locally (gitignored). `apps/web/.env.example` lists variable **names** with placeholder values only. |
| CI (GitHub Actions) | GitHub encrypted secrets, only if a workflow ever needs one. The MariaDB service password in `web-ci.yml` is a throwaway for an ephemeral container. |

Ignored by `.gitignore`: `.env` / `.env.*` (except `.env.example`), `secrets.json`,
secrets folders, `*.pem` / `*.pfx` / `*.p12` / `*.key`, `.aws/`.

## If a secret is committed

1. **Revoke / rotate it at the provider first.** Deleting it from the repo does not
   help - the repo is public and git history (and forks/caches) keep it.
2. Remove it from the working tree in a normal commit.
3. Only then consider a history rewrite; it is optional once the credential is dead.

Known historical exposure: an AWS access key ID (plus an AWS secret-key setting) is
in history at commit `a70b251` (legacy `launchSettings.json`, May 2026). The key has
been **deleted** in AWS IAM, so it is dead; history was deliberately not rewritten.
The project no longer uses AWS.

## Reporting

Open a private security advisory on GitHub (Security -> Advisories) rather than a
public issue.
