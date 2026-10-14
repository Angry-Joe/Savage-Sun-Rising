import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import MobileNav from "@/components/mobile-nav";

export const NAV = [
  { href: "/spells", label: "Spells" },
  { href: "/powers", label: "Psionic Powers" },
  { href: "/monsters", label: "Monsters" },
  { href: "/characters", label: "My Characters" },
];

export default function SiteHeader() {
  return (
    <header className="border-b-2 border-ochre/60 bg-gradient-to-b from-blood/50 to-card">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-4">
        <Link
          href="/"
          className="font-heading text-2xl font-semibold tracking-wide text-parchment no-underline hover:text-ochre"
        >
          Savage Sun Rising
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-5 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-lg text-parchment/90 no-underline hover:text-ochre hover:underline"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <AuthButton />
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
