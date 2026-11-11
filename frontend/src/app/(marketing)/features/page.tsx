import type { Metadata } from "next";

import { CategoryIndex } from "@/components/marketing/category-index";
import { CtaBand } from "@/components/marketing/cta-band";
import { FeaturesSection } from "@/components/marketing/features-section";
import { InterviewersLanguages } from "@/components/marketing/interviewers-languages";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Features — role-tailored interviews and feedback",
  description:
    "Practice with questions generated for your role and interview category, answer by voice or text, and review AI-generated feedback.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        title="A focused space to practice your next interview"
        description="Choose your role, category, difficulty, and language. Practice by voice or text, then review feedback for each answer."
        breadcrumb={[{ label: "Features" }]}
      />
      <FeaturesSection />
      <CategoryIndex />
      <InterviewersLanguages />
      <CtaBand />
    </>
  );
}
