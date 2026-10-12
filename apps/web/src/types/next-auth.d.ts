import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Authentik OIDC `sub` - use as `Character.ownerId`. */
      id: string;
    } & DefaultSession["user"];
  }
}
