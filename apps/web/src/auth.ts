import NextAuth from "next-auth";
import Authentik from "next-auth/providers/authentik";

/**
 * Auth.js (next-auth v5) with Authentik as the single OIDC provider.
 *
 * - Google / Microsoft / anything else are configured as *sources inside
 *   Authentik*, not here - the app only ever talks to Authentik.
 * - Sessions are stateless JWTs in an encrypted cookie (no DB adapter). The
 *   Authentik user (`sub`) is the identity; `Character.ownerId` stores it.
 *
 * Env (see .env.example / docs/AUTH.md):
 *   AUTH_SECRET, AUTH_URL, AUTH_TRUST_HOST,
 *   AUTH_AUTHENTIK_ID, AUTH_AUTHENTIK_SECRET, AUTH_AUTHENTIK_ISSUER
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Authentik({
      clientId: process.env.AUTH_AUTHENTIK_ID,
      clientSecret: process.env.AUTH_AUTHENTIK_SECRET,
      // Copy Authentik's "OpenID Configuration Issuer" exactly (incl. trailing slash).
      issuer: process.env.AUTH_AUTHENTIK_ISSUER,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, profile }) {
      // On sign-in, pin the token subject to Authentik's stable `sub` claim.
      if (profile?.sub) token.sub = profile.sub;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    // Used by middleware.ts: protected routes require a signed-in user.
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
