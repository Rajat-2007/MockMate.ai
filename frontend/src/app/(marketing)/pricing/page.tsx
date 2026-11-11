import type { Metadata } from "next";

import { CtaBand } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/faq-section";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingSection } from "@/components/marketing/pricing-section";

export const metadata: Metadata = {
  title: "Pricing — free, Starter and Pro plans",
  description:
    "Compare MockMate AI monthly interview quotas, AI question generation, voice and text practice, and reports. Prices in INR.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        title="Plans compared by what they allow"
        description="Monthly interview quotas and the included AI practice features, with secure UPI checkout for paid plans."
        breadcrumb={[{ label: "Pricing" }]}
      />
      <PricingSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
