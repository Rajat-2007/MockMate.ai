import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Mic, Play, Sparkles, Volume2 } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "AI Mock Interview Online — Live Voice Practice & Instant Feedback",
  description:
    "Practice realistic AI mock interviews with conversational voice answers, adaptive follow-up questions, and instant rubric scoring.",
  alternates: { canonical: "/ai-mock-interview" },
};

export default function AiMockInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="Live Conversational AI Mock Interviews"
        description="Speak your answers out loud. Our conversational AI interviewer listens, evaluates your logic, and asks challenging follow-up questions just like a human hiring manager."
        breadcrumb={[{ label: "AI Mock Interview" }]}
      >
        <div className="mt-6 flex flex-wrap gap-4">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">Start Free AI Mock Interview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/how-it-works">See How It Works</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <Mic className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">Real-Time Voice AI</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              No robotic forms or static quizzes. Answer questions naturally by speaking into your
              microphone. AI transcribes and scores your oral delivery live.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Bot className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Adaptive Follow-ups</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Demonstrate understanding, and the interviewer digs deeper into implementation details.
              Miss a concept, and it guides you toward explaining the fundamentals.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Sparkles className="size-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Instant Diagnostic Report</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Receive a complete scored rubric breakdown, identified weak areas, and model exemplary
              answers for every question answered.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
