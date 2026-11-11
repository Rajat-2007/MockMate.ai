import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { TypographyH2 } from "@/components/typography";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="bg-band border-border/70 border-t">
      <div className="container-page flex min-h-[15rem] flex-col justify-center gap-8 py-12 sm:items-center sm:justify-between lg:flex-row">
        <div>
          <TypographyH2 className="max-w-[28rem] text-[1.7rem] sm:text-[1.9rem]">
            Your Next Interview Starts Here.
          </TypographyH2>
          <p className="text-ink-70 mt-2.5 text-[0.8rem]">
            Free plan: 4 interviews a month, text mode, no card required.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Button
            asChild
            className="bg-brand-gradient hover:bg-brand-gradient h-11 px-6 text-[0.85rem] text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.95)] hover:brightness-105"
          >
            <Link href="/signup">Start Free Interview</Link>
          </Button>
          <Link
            href="/pricing"
            className="text-foreground/80 hover:text-foreground inline-flex items-center gap-1.5 text-[0.78rem] font-medium underline decoration-current/30 underline-offset-4 transition-colors"
          >
            See plans and limits
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
