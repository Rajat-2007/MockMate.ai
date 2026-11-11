import { describe, expect, it } from "vitest";

import {
  capabilities,
  faqs,
  interviewCategories,
  interviewLanguages,
  interviewerPersonalities,
  plans,
  processSteps,
  productFeatures,
  sessionPreview,
} from "@/lib/marketing-data";

describe("marketing content", () => {
  it("matches the capability counts advertised on the page", () => {
    expect(capabilities.map((capability) => capability.value)).toEqual([
      "10",
      "11",
      "6",
      "5",
    ]);
    expect(interviewCategories).toHaveLength(10);
    expect(interviewLanguages).toHaveLength(11);
    expect(interviewerPersonalities).toHaveLength(6);
    expect(processSteps).toHaveLength(5);
    expect(productFeatures).toHaveLength(5);
  });

  it("uses unique category slugs and names", () => {
    const slugs = interviewCategories.map((category) => category.slug);
    const names = interviewCategories.map((category) => category.name);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps interview languages unique", () => {
    const codes = interviewLanguages.map((language) => language.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("orders plan interview quotas free < starter < pro", () => {
    const quotas = plans.map((plan) =>
      Number.parseInt(plan.limits[0].value, 10),
    );
    expect(quotas).toEqual([4, 20, 60]);
  });

  it("uses the current monthly prices for all plans", () => {
    expect(plans[0].priceInr).toBe(0);
    expect(plans.map((plan) => plan.priceInr)).toEqual([0, 149, 499]);
  });

  it("keeps the sample score average equal to the stated overall score", () => {
    const average =
      sessionPreview.scores.reduce((total, score) => total + score.value, 0) /
      sessionPreview.scores.length;
    expect(average.toFixed(1)).toBe(sessionPreview.overallScore);
  });

  it("has no duplicate FAQ questions", () => {
    const questions = faqs.map((faq) => faq.question);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("never claims user counts, ratings or testimonials", () => {
    const serialised = JSON.stringify({
      capabilities,
      interviewCategories,
      interviewerPersonalities,
      plans,
      faqs,
      sessionPreview,
    }).toLowerCase();

    for (const banned of [
      "testimonial",
      "rating",
      "stars",
      "success rate",
      "placement rate",
      "users trust",
    ]) {
      expect(serialised).not.toContain(banned);
    }
  });
});
