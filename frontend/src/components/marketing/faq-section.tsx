import Link from "next/link";

import { Section, SectionHeader } from "@/components/marketing/section";
import { TypographyH3, TypographyP } from "@/components/typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/marketing-data";

export function FaqSection() {
  return (
    <Section id="faq">
      <SectionHeader title="Questions we get before signing up" />

      <div className="grid gap-8 lg:grid-cols-[1fr_17rem] lg:gap-14">
        <Accordion type="single" collapsible defaultValue="faq-0">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-[0.86rem] font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-ink-70 max-w-[38rem] text-[0.8rem] leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <aside className="bg-band/40 border-accent/20 h-fit self-start rounded-lg border p-5">
          <TypographyH3 className="text-[0.85rem]">
            Plans, privacy or refunds
          </TypographyH3>
          <TypographyP className="mt-2 text-[0.76rem]">
            Support answers by email within one working day. Account and resume
            deletion requests go to the same team.
          </TypographyP>
          <Link
            href="/contact"
            className="text-accent border-accent/25 hover:border-accent mt-4 inline-block border-b pb-0.5 text-[0.76rem] font-semibold transition-colors"
          >
            Contact support
          </Link>
        </aside>
      </div>
    </Section>
  );
}
