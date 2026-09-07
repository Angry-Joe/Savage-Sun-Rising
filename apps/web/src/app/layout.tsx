import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Savage Sun Rising",
  description: "Athas-focused TTRPG content browser — spells, powers, monsters",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav>
            <Link href="/" className="brand">
              Savage Sun Rising
            </Link>
            <Link href="/spells">Spells &amp; Powers</Link>
            <Link href="/monsters">Monsters (Athas)</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
