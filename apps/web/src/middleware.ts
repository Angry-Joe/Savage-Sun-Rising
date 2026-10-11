export { auth as middleware } from "@/auth";

/**
 * Only character / campaign routes require sign-in. Public content browsing
 * (/, /spells, /monsters) stays open. Unauthenticated requests are redirected
 * to the Auth.js sign-in flow by the `authorized` callback in src/auth.ts.
 */
export const config = {
  matcher: ["/characters/:path*", "/campaigns/:path*"],
};
