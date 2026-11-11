import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartHandshake, MessageSquare, Sparkles, Users } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "HR Mock Interview Online — Behavioral Questions & STAR Method",
  description:
    "Master HR rounds, behavioral interviews, leadership scenarios, teamwork, and salary discussions with conversational AI feedback.",
  alternates: { canonical: "/hr-interview" },
};

export default function HrInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="HR & Behavioral Mock Interview Preparation"
        description="Master the questions that decide culture fit and hiring offers: 'Tell me about yourself', conflict resolution, leadership examples, and compensation expectations."
        breadcrumb={[{ label: "HR Interview" }]}
      >
        <div className="mt-6">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">Start Free HR Mock Interview</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <MessageSquare className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">The STAR Framework</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              AI evaluates whether your answers follow Situation, Task, Action, and Result with quantifiable outcomes.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Users className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Teamwork & Conflict</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Realistic behavioral questions simulating disagreements, difficult deadlines, and cross-functional collaboration.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <HeartHandshake className="size-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Culture Fit & Motivation</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Articulate why you are the ideal fit for your target organization with poise and conviction.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
