import { Check } from "lucide-react";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/marketing/section";
import {
  TypographyH3,
  TypographyMuted,
  TypographyP,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { planInclusions, plans, pricingNote } from "@/lib/marketing-data";
import { cn, formatInr } from "@/lib/utils";

type PricingSectionProps = {
  /** Marketing pages keep the note; the pricing page repeats it near the CTA. */
  showNote?: boolean;
};

export function PricingSection({ showNote = true }: PricingSectionProps) {
  return (
    <Section id="pricing">
      <SectionHeader
        title="Pricing"
        description="Every plan includes fresh AI-generated questions, voice or text practice, and an AI evaluation report."
      />

      <div className="border-border/70 grid border-t lg:grid-cols-3">
        {plans.map((plan, index) => (
          <div
            key={plan.slug}
            className={cn(
              "flex flex-col py-6",
              index === 0
                ? "lg:pr-7"
                : "border-border/70 border-t lg:border-t-0 lg:border-l lg:px-7",
              index === plans.length - 1 && "lg:pr-0",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <TypographyH3>{plan.name}</TypographyH3>
              {plan.featured ? (
                <span className="bg-band text-foreground rounded-[3px] px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.06em] uppercase">
                  Recommended
                </span>
              ) : null}
            </div>
            <TypographyP className="mt-1 min-h-[2.6rem] text-[0.76rem]">
              {plan.forWhom}
            </TypographyP>

            <div className="mt-4 mb-5 flex items-baseline gap-1.5">
              <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em]">
                {formatInr(plan.priceInr)}
              </span>
              <span className="text-ink-50 text-[0.7rem]">{plan.cadence}</span>
            </div>

            <dl className="mb-6">
              {plan.limits.map((limit) => (
                <div
                  key={limit.label}
                  className="border-border/70 flex items-baseline justify-between gap-3 border-t border-dashed py-2"
                >
                  <dt className="text-ink-70 text-[0.76rem]">{limit.label}</dt>
                  <dd className="text-metric text-foreground text-[0.72rem]">
                    {limit.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Button
              asChild
              variant={plan.featured ? "default" : "outline"}
              className={cn(
                "mt-auto h-10 w-full",
                plan.featured &&
                  "bg-brand-gradient hover:bg-brand-gradient text-white hover:brightness-105",
              )}
            >
              <Link href="/signup">{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <ul className="border-border/70 mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4">
        {planInclusions.map((inclusion) => (
          <li
            key={inclusion}
            className="text-ink-70 flex items-center gap-1.5 text-[0.74rem]"
          >
            <Check className="text-accent size-3.5" aria-hidden />
            {inclusion}
          </li>
        ))}
      </ul>

      {showNote ? (
        <TypographyMuted className="mt-3">{pricingNote}</TypographyMuted>
      ) : null}
    </Section>
  );
}
