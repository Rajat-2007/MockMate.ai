import { ChevronRight } from "lucide-react";
import Link from "next/link";

import {
  TypographyH1,
  TypographyLead,
} from "@/components/typography";

export type Crumb = {
  label: string;
  href?: string;
};

type PageHeroProps = {
  title: string;
  description: string;
  breadcrumb: Crumb[];
  children?: React.ReactNode;
};

/** Shared header block for inner marketing pages, including breadcrumbs. */
export function PageHero({
  title,
  description,
  breadcrumb,
  children,
}: PageHeroProps) {
  return (
    <section className="container-page pt-7 pb-4 sm:pt-9 lg:pt-11">
      <nav aria-label="Breadcrumb">
        <ol className="text-ink-50 flex flex-wrap items-center gap-1.5 text-[0.7rem]">
          <li>
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
          </li>
          {breadcrumb.map((crumb) => (
            <li key={crumb.label} className="flex items-center gap-1.5">
              <ChevronRight className="size-3 opacity-60" aria-hidden />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-accent transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink-70">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <TypographyH1 className="mt-4 max-w-[38rem] text-[1.9rem] leading-[1.08] sm:text-[2.3rem] lg:text-[2.85rem]">
        {title}
      </TypographyH1>
      <TypographyLead className="mt-3 max-w-[38rem]">{description}</TypographyLead>
      {children}
    </section>
  );
}
