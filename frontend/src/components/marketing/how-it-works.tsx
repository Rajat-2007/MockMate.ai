import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/marketing/section";
import { TypographyMetric } from "@/components/typography";
import { processSteps } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

const cascade = [
  "lg:ml-0",
  "lg:ml-[6%]",
  "lg:ml-[12%]",
  "lg:ml-[18%]",
  "lg:ml-[24%]",
];

export function HowItWorks() {
  return (
    <Section tone="band" id="how-it-works">
      <SectionHeader
        title="How a mock interview runs"
        description="Five steps from your first profile to a scored report. You can change any setting before the session starts."
      />

      <ol className="flex flex-col gap-2.5">
        {processSteps.map((step, index) => (
          <li key={step.order} className={cn(cascade[index] ?? "lg:ml-0")}>
            <Reveal>
              <div className="bg-background border-accent/20 grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 rounded-lg border px-4 py-3.5 sm:px-5 sm:py-4">
                <TypographyMetric className="text-accent text-[0.72rem]">
                  {String(step.order).padStart(2, "0")}
                </TypographyMetric>
                <div>
                  <h3 className="text-[0.95rem] font-semibold tracking-[-0.01em]">
                    {step.title}
                  </h3>
                  <p className="text-ink-70 mt-0.5 text-[0.78rem] leading-snug">
                    {step.description}
                  </p>
                </div>
                <ArrowUpRight
                  className="text-accent size-4 opacity-60"
                  aria-hidden
                />
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
