import type { Metadata } from "next";

import { CapabilityStrip } from "@/components/marketing/capability-strip";
import { CategoryIndex } from "@/components/marketing/category-index";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { InterviewersLanguages } from "@/components/marketing/interviewers-languages";
import { PricingSection } from "@/components/marketing/pricing-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Practice Interviews with an AI Interviewer`,
  description:
    "Practice with role-tailored AI interview questions, answer by voice or text, and get an answer-by-answer evaluation.",
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      publisher: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description: siteConfig.description,
      url: siteConfig.url,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "Free plan with four interviews a month in text mode.",
      },
      featureList: [
        "AI mock interviews",
        "Voice and text answers",
        "Role-tailored questions",
        "AI answer evaluation",
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is static, generated at build time.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      <CapabilityStrip />
      <HowItWorks />
      <CategoryIndex />
      <InterviewersLanguages />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
