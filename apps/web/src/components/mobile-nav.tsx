"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <MenuIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="font-heading text-ochre">Savage Sun Rising</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
          {[{ href: "/", label: "Home" }, ...items].map((n) => (
            <SheetClose asChild key={n.href}>
              <Link href={n.href} className="rounded-md px-3 py-2 text-lg no-underline hover:bg-accent hover:text-ochre">
                {n.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
