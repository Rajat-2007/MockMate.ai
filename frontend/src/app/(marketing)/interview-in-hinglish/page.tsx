import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Globe, MessageSquare, Mic, Sparkles } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Hinglish AI Mock Interview — Practice in Natural Hindi-English Mix",
  description:
    "Prepare for interviews in natural Hinglish conversation. Practice speaking just like you would in real Indian placement rounds.",
  alternates: { canonical: "/interview-in-hinglish" },
};

export default function HinglishInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="Practice Interviews in Natural Hinglish"
        description="Most campus and startup interviews in India happen in a natural blend of Hindi and English. MockMate AI understands conversational Hinglish with zero friction."
        breadcrumb={[{ label: "Interview in Hinglish" }]}
      >
        <div className="mt-6">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">Start Free Hinglish Interview</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <Mic className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">Natural Mixed Speech</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Speak naturally: &apos;Maine backend FastAPI me build kiya tha aur database PostgreSQL tha.&apos;
              MockMate AI captures and understands every word.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Bot className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Substantive Evaluation</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              We evaluate your conceptual depth and problem-solving ability, not just English grammar.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Sparkles className="size-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Confidence Booster</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Gradually transition toward professional English while keeping your confidence and fluency high.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
