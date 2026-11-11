import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Globe, Heart, Shield, Sparkles, Target, Users } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `About ${siteConfig.name} — Democratizing Interview Preparation`,
  description:
    "MockMate AI makes elite interview coaching accessible and affordable to every student across India and worldwide.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="Democratizing Career Preparation for Every Student"
        description="We believe that job readiness shouldn't depend on expensive coaching centers, elite college pedigree, or geographical location."
        breadcrumb={[{ label: "About" }]}
      />

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Our Vision: An AI Interview Coach for Everyone
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every year, millions of students across Engineering, Commerce, Management, Arts, Science,
              Law and Healthcare graduate from colleges across India. However, the lack of realistic
              interview practice and objective feedback prevents talented candidates from cracking their
              dream placements.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MockMate AI was built from the ground up to bridge this gap. We provide an authentic,
              multilingual AI interviewer that evaluates candidates on substantive domain knowledge,
              communication clarity, and answer structure — regardless of their native language.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/80 p-5 bg-card shadow-sm">
              <Users className="size-8 text-primary mb-2" />
              <h3 className="font-bold text-sm text-foreground">Inclusive For All</h3>
              <p className="text-xs text-muted-foreground mt-1">
                From BCA & B.Tech to MBA, B.Com, LLB & MBBS.
              </p>
            </Card>

            <Card className="border-border/80 p-5 bg-card shadow-sm">
              <Globe className="size-8 text-blue-600 mb-2" />
              <h3 className="font-bold text-sm text-foreground">11 Languages</h3>
              <p className="text-xs text-muted-foreground mt-1">
                English, Hindi, Hinglish, Tamil, Bengali & more.
              </p>
            </Card>

            <Card className="border-border/80 p-5 bg-card shadow-sm">
              <Target className="size-8 text-purple-600 mb-2" />
              <h3 className="font-bold text-sm text-foreground">Rubric Scoring</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Clear, explainable feedback on every answer.
              </p>
            </Card>

            <Card className="border-border/80 p-5 bg-card shadow-sm">
              <Shield className="size-8 text-emerald-600 mb-2" />
              <h3 className="font-bold text-sm text-foreground">Private & Secure</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your resumes and transcripts are 100% private.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Card */}
        <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Experience the Future of Interview Preparation
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Try your first AI mock interview free today. No credit card required.
          </p>
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup" className="flex items-center gap-2">
              Start Free Interview <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
