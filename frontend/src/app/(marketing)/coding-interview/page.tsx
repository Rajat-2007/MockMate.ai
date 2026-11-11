import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Braces, Code2, Cpu, Terminal, Zap } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Live Coding & DSA Mock Interview — Python, Java, C++, JavaScript",
  description:
    "Practice live technical coding rounds with interactive code execution, test cases, and real-time algorithmic complexity feedback.",
  alternates: { canonical: "/coding-interview" },
};

export default function CodingInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="Live Coding & DSA Interview Practice"
        description="Solve real algorithmic problems in Python, Java, C++, or JavaScript. Run sample and hidden test cases with immediate feedback on time and space complexity."
        breadcrumb={[{ label: "Coding Interview" }]}
      >
        <div className="mt-6">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">Start Live Coding Round</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <Braces className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">Interactive Code Runner</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Monaco-powered IDE with syntax highlighting, autocomplete, and multi-language support.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Terminal className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Test Case Validation</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Verifies edge cases, memory limits, and runtime limits across sample and hidden test cases.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Zap className="size-8 text-amber-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Complexity Feedback</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Get evaluated on whether your solution meets optimal Big-O Time & Space constraints.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
