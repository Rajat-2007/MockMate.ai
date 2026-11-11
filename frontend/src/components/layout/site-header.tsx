"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-border/80 bg-background/95 border-b">
      <div className="container-page flex h-[4.25rem] items-center gap-8">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-70 hover:text-accent text-[0.82rem] font-medium transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/login"
            className="text-ink-70 hover:text-foreground hidden text-[0.82rem] font-medium transition-colors sm:block"
          >
            Log in
          </Link>
          <Button
            asChild
            className="bg-brand-gradient hover:bg-brand-gradient h-9 px-4 text-[0.8rem] text-white shadow-[0_8px_18px_-12px_rgba(79,70,229,0.9)] hover:brightness-105"
          >
            <Link href="/signup">Start free interview</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[17rem]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="px-4">
                <ul className="flex flex-col">
                  {siteConfig.nav.map((item) => (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className="border-border/70 hover:text-accent block border-b py-3 text-sm font-medium transition-colors"
                        >
                          {item.title}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="h-10">
                    <Link href="/login">Log in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    asChild
                    className="bg-brand-gradient hover:bg-brand-gradient h-10 text-white hover:brightness-105"
                  >
                    <Link href="/signup">Start free interview</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
