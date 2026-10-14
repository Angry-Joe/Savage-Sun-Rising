import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Savage Sun Rising", template: "%s · Savage Sun Rising" },
  description: "Athas-focused TTRPG content browser - spells, psionic powers, monsters",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 pb-10 text-base text-muted-foreground">
          Content: Depp-Magic spells &amp; psionics v3.6 · complete-compendium monsters.
        </footer>
      </body>
    </html>
  );
}
