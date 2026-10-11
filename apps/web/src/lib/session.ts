import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Returns the signed-in user's Authentik `sub` (stored as `Character.ownerId`),
 * or redirects to sign-in. Use in server components / actions that touch
 * user-owned data - middleware is the first gate, this is the second.
 */
export async function requireUserId(callbackUrl = "/characters"): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return id;
}
