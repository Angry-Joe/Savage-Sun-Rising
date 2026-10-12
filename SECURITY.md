# Security & secrets

**Secrets are never committed to this repository.** Not in `appsettings*.json`,
`launchSettings.json`, `.env`, scripts, workflows or docs.

Where secrets live instead:

| Code | Source of secrets |
| --- | --- |
| `apps/web` (Next.js) | Environment variables, or `apps/web/.env` locally (gitignored). `apps/web/.env.example` lists the variable **names** with placeholder values only. |
| `DarkSun.*` (legacy Blazor, deprecated) | `dotnet user-secrets` (UserSecretsId in `DarkSun.Web.csproj`) or environment variables (`Authentication__Google__ClientId`, ...). |
| CI (GitHub Actions) | GitHub encrypted secrets, only if a workflow ever needs one. |

Ignored by `.gitignore`: `.env` / `.env.*` (except `.env.example`), `secrets.json`,
user-secrets folders, `Properties/launchSettings.json`, `DataProtection-Keys/`,
`*.pem` / `*.pfx` / `*.key`, `.aws/`.

## If a secret is committed

1. **Revoke / rotate it at the provider first.** Deleting it from the repo does not
   help - the repo is public and git history (and forks/caches) keep it.
2. Remove it from the working tree in a normal commit.
3. Only then consider a history rewrite; it is optional once the credential is dead.

Known historical exposure: an AWS access key ID (plus an AWS secret-key setting) is
in history at commit `a70b251` (`DarkSun.Web/Properties/launchSettings.json`, May
2026). That key must be deactivated/rotated in AWS IAM. History was deliberately not
rewritten.

## Reporting

Open a private security advisory on GitHub (Security -> Advisories) rather than a
public issue.
