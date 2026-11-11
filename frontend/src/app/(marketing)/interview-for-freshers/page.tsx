import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Lightbulb, Sparkles } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mock Interview for Freshers & College Students — Placement Preparation",
  description:
    "Tailored interview practice for freshers, final year college students and entry-level job seekers across all degrees.",
  alternates: { canonical: "/interview-for-freshers" },
};

export default function FreshersInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="AI Mock Interview Practice for Freshers"
        description="Designed specifically for college students and recent graduates preparing for on-campus and off-campus placement drives."
        breadcrumb={[{ label: "Interview for Freshers" }]}
      >
        <div className="mt-6">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">Start Free Fresher Interview</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <GraduationCap className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">Campus Placement Ready</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Covers aptitude reasoning, branch fundamentals, college projects, and HR questions common in placement drives.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Lightbulb className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Zero-Experience Scenarios</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Questions focus on academic coursework, extracurricular initiatives, and learning agility rather than years of industry tenure.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Sparkles className="size-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Constructive Coaching</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Gentle, encouraging feedback specifically calibrated to help fresh graduates overcome interview anxiety.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
