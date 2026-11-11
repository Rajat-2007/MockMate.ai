import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, HelpCircle, Sparkles } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Interview Questions & Answers Bank — Curated by Domain & Course",
  description:
    "Explore top interview questions for B.Tech, BCA, MBA, B.Com, and other streams with ideal model answers and evaluation criteria.",
  alternates: { canonical: "/interview-questions" },
};

const SAMPLE_QUESTION_BANKS = [
  {
    category: "Computer Science & IT (B.Tech / BCA)",
    count: "120+ Questions",
    topics: ["Data Structures & Algorithms", "SQL & Database Indexing", "Operating Systems", "System Design"],
  },
  {
    category: "Management & Strategy (MBA / BBA)",
    count: "85+ Questions",
    topics: ["Market Entry Case Studies", "Financial Valuation", "HR Conflict Scenarios", "Supply Chain Optimization"],
  },
  {
    category: "Commerce & Accounting (B.Com / CA)",
    count: "95+ Questions",
    topics: ["GST & Corporate Taxation", "Balance Sheet Analysis", "Auditing Standards", "Banking & Working Capital"],
  },
  {
    category: "Behavioral & HR (All Streams)",
    count: "60+ Questions",
    topics: ["STAR Leadership Scenarios", "Weaknesses & Self-Awareness", "Salary Negotiation", "Career Transitions"],
  },
];

export default function InterviewQuestionsPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="Curated Interview Questions & Rubric Guidelines"
        description="Browse subject-specific questions asked by top Indian and global employers across engineering, commerce, management, and humanities."
        breadcrumb={[{ label: "Interview Questions" }]}
      />

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_QUESTION_BANKS.map((bank) => (
            <Card key={bank.category} className="border-border/80 p-5 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-primary">{bank.count}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary">
                  Curated Bank
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground mb-3">{bank.category}</h3>

              <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
                {bank.topics.map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-foreground/80">
                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link href="/interview/setup" className="flex items-center justify-center gap-1">
                  Practice These Questions in AI Session <ArrowRight className="size-3" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
