# Authentication: Auth.js + Authentik

`apps/web` signs users in with **Auth.js (next-auth v5)** using **Authentik as the
only OIDC provider**. Google, Microsoft, etc. are added as *sources inside
Authentik*; the app never holds Google/Microsoft credentials.

```
browser ──> apps/web (/api/auth/*) ──OIDC──> Authentik ──> Google / Microsoft / local
```

## What's in the app

| File | Purpose |
| --- | --- |
| `apps/web/src/auth.ts` | Auth.js config: Authentik provider, JWT sessions, `session.user.id = sub` |
| `apps/web/src/app/api/auth/[...nextauth]/route.ts` | Auth.js route handlers (sign-in, callback, sign-out, session) |
| `apps/web/src/middleware.ts` | Requires sign-in for `/characters/*` and `/campaigns/*`; spells/monsters stay public |
| `apps/web/src/lib/session.ts` | `requireUserId()` - server-side guard returning the Authentik `sub` |
| `apps/web/src/components/AuthButton.tsx` | Header sign-in / sign-out |
| `apps/web/src/app/characters/page.tsx` | Example protected page: lists characters where `ownerId = sub` |

**Sessions are stateless JWTs** (encrypted cookie, `AUTH_SECRET`), with no Prisma
adapter and no user/account/session tables. Authentik is the user store, and the
only identity the app needs is the stable OIDC `sub`, already modelled as
`Character.ownerId` in `prisma/schema.prisma`. That avoids four extra tables and
a schema migration. Add `@auth/prisma-adapter` later only if the app needs its own
user rows (profiles, linking several IdPs to one user outside Authentik, and so on).

`Character.ownerId` stays nullable until existing rows are backfilled (see
ARCHITECTURE.md). Then make it required.

## Environment variables

Set these in `apps/web/.env` locally (gitignored) or in the service environment in
production. Placeholders are in `apps/web/.env.example`.

| Variable | Value |
| --- | --- |
| `AUTH_SECRET` | Random secret (`npx auth secret` or `openssl rand -base64 33`), different per environment |
| `AUTH_URL` | Public base URL of the app as the browser sees it, e.g. `https://ssr.example.com` (dev: `http://localhost:3000`) |
| `AUTH_TRUST_HOST` | `true` - required behind cloudflared/any reverse proxy so Auth.js trusts `X-Forwarded-Host/Proto` |
| `AUTH_AUTHENTIK_ID` | Authentik provider **Client ID** |
| `AUTH_AUTHENTIK_SECRET` | Authentik provider **Client Secret** |
| `AUTH_AUTHENTIK_ISSUER` | Authentik **OpenID Configuration Issuer**, copied exactly, e.g. `https://auth.example.com/application/o/savage-sun-rising/` (**keep the trailing slash**; Auth.js compares it byte-for-byte with Authentik's discovery document) |

## 1. Create the provider + application in Authentik

Admin interface -> **Applications -> Providers -> Create -> OAuth2/OpenID Provider**:

- **Name:** `savage-sun-rising`
- **Authorization flow:** `default-provider-authorization-implicit-consent` (or explicit)
- **Client type:** Confidential
- **Redirect URIs** (Strict):
  - `${AUTH_URL}/api/auth/callback/authentik`, e.g. `https://ssr.example.com/api/auth/callback/authentik`
  - dev: `http://localhost:3000/api/auth/callback/authentik`
- **Signing key:** pick a certificate (e.g. `authentik Self-signed Certificate`) so
  ID tokens are RS256-signed.
- **Scopes:** `openid`, `email`, `profile` (defaults).
- **Subject mode:** leave the default ("Based on the User's hashed ID"). **Don't
  change it later**, because `sub` is stored as `Character.ownerId`.

Then **Applications -> Create**: name `Savage Sun Rising`, slug
`savage-sun-rising`, provider = the one above. The provider page shows the
**Client ID / Secret** and the **OpenID Configuration Issuer**
(`https://<authentik>/application/o/savage-sun-rising/`). Put them into the env vars.

Optional: bind a group/policy to the application to restrict who can sign in.

## 2. Add Google and Microsoft as Authentik sources

These redirect URIs point at **Authentik**, not at the app.

**Google** (Google Cloud Console -> APIs & Services -> Credentials -> OAuth client ID, type *Web application*):
- Authorized redirect URI: `https://<authentik>/source/oauth/callback/google/`
- In Authentik: **Directory -> Federation & Social login -> Create -> Google OAuth Source**,
  slug `google`, paste the Client ID/Secret.

**Microsoft** (Entra admin center -> App registrations -> New registration):
- Supported account types: whichever you want, usually "personal + any org" for public sign-in.
- Redirect URI (Web): `https://<authentik>/source/oauth/callback/microsoft/`
- Create a client secret (note its expiry date) and paste the **Value**, not the
  Secret ID, with no leading/trailing whitespace.
- In Authentik: **Create -> Entra ID / Azure AD OAuth Source** (name depends on version),
  slug `microsoft`.

For both sources, set the enrollment flow (e.g. `default-source-enrollment`) so
first-time users get created. Add the sources to the identification stage
(**Flows & Stages -> Stages -> default-authentication-identification -> Sources**) so
the buttons appear on Authentik's login page.

## 3. Proxy / cloudflared notes

- `AUTH_URL` must be the public https URL, and `AUTH_TRUST_HOST=true`. Otherwise
  Auth.js builds `http://internal-host:3000/...` callback URLs that don't match the
  registered redirect URI.
- The issuer must be reachable **from the app host** (Auth.js fetches
  `${issuer}.well-known/openid-configuration` and calls the token endpoint
  server-to-server). It must also be the **public** hostname, because the
  browser is redirected to the authorize endpoint from the same discovery
  document. If the app host can't reach Authentik's public hostname, fix
  DNS/hairpinning; don't point the issuer at an internal URL, or the issuer check fails.
- Docker: not used. `docs/ARCHITECTURE.md` says no containers, and Authentik already
  runs as its own stack, so no Authentik service is added to this repo.

## Quick test

1. Fill `apps/web/.env` (see above), then `npm run dev` in `apps/web`.
2. Open http://localhost:3000/characters. You are redirected to Authentik, sign in,
   and land back on `/characters`, which shows your `sub`.
3. "Sign out" in the header clears the session cookie (the Authentik session itself
   stays signed in, as usual for OIDC).
