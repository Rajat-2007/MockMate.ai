import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/marketing/section";
import { interviewCategories } from "@/lib/marketing-data";

export function CategoryIndex() {
  return (
    <Section id="categories">
      <SectionHeader
        title="Interview categories"
        description="Choose a field to shape the questions around the role and topics you want to practice."
      />

      <ul className="grid gap-x-14 lg:grid-cols-2">
        {interviewCategories.map((category) => {
          const Icon = category.icon;
          return (
            <li key={category.slug}>
              <Link
                href={category.href}
                className="border-border/70 hover:bg-band/25 group grid grid-cols-[1.25rem_1fr_auto] items-center gap-3.5 border-t px-1 py-3.5 transition-colors"
              >
                <Icon className="text-accent size-4" aria-hidden />
                <span>
                  <span className="block text-[0.92rem] font-semibold tracking-[-0.01em]">
                    {category.name}
                  </span>
                  <span className="text-ink-70 mt-0.5 block text-[0.74rem] leading-snug">
                    {category.scope}
                  </span>
                </span>
                <ArrowUpRight
                  className="text-ink-50 group-hover:text-accent size-4 transition-colors"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
