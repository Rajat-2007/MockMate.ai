import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq-section";
import { PageHero } from "@/components/marketing/page-hero";
import { faqs } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: "FAQ — languages, scoring and data",
  description:
    "Answers to the questions people ask before signing up: interview languages, stream-specific question banks, how answers are scored, and how resumes are stored.",
  alternates: { canonical: "/faq" },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Mirrors the visible FAQ copy on this page.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <PageHero
        title="Before you sign up"
        description="Questions about languages, stream-specific question banks, scoring and what happens to your resume and transcript."
        breadcrumb={[{ label: "FAQ" }]}
      />
      <FaqSection />
      <CtaBand />
    </>
  );
}
