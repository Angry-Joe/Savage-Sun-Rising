import { auth, signIn, signOut } from "@/auth";

/** Header sign-in / sign-out control (server component + server actions). */
export default async function AuthButton() {
  const session = await auth();

  if (!session?.user) {
    return (
      <form
        className="auth"
        action={async () => {
          "use server";
          await signIn("authentik");
        }}
      >
        <button type="submit">Sign in</button>
      </form>
    );
  }

  return (
    <form
      className="auth"
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <span className="meta">{session.user.name ?? session.user.email}</span>
      <button type="submit">Sign out</button>
    </form>
  );
}
