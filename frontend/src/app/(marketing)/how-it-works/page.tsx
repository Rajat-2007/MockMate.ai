import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { InterviewersLanguages } from "@/components/marketing/interviewers-languages";
import { PageHero } from "@/components/marketing/page-hero";
import { FaqSection } from "@/components/marketing/faq-section";

export const metadata: Metadata = {
  title: "How it works — from profile to scored report",
  description:
    "The five steps of a MockMate AI interview: profile, career goal, language, the interview itself and the performance report.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        title="How a MockMate AI interview runs"
        description="Setup takes one screen. After that, each session is created against your saved profile, so switching category or language takes a few clicks."
        breadcrumb={[{ label: "How it works" }]}
      />
      <HowItWorks />
      <InterviewersLanguages />
      <FaqSection />
      <CtaBand />
    </>
  );
}
