import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TypographyH1, TypographyLead } from "@/components/typography";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-page flex flex-1 flex-col justify-center py-20">
        <p className="text-metric text-accent text-[0.7rem]">404</p>
        <TypographyH1 className="mt-3 max-w-xl text-[2rem] sm:text-[2.4rem]">
          That page is not here.
        </TypographyH1>
        <TypographyLead className="mt-3 max-w-md">
          The link may be old, or this part of the product is not public yet. The
          pages that exist today are listed in the header.
        </TypographyLead>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild variant="outline" className="h-10">
            <Link href="/">
              <ArrowLeft aria-hidden />
              Back to home
            </Link>
          </Button>
          <Link
            href="/features"
            className="text-accent border-accent/25 hover:border-accent border-b pb-0.5 text-[0.8rem] font-medium transition-colors"
          >
            See the features
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
