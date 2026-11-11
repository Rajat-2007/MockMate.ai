import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSearch, FileText, Sparkles, Target } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Resume Based Mock Interview — Practice Your Exact Projects & Skills",
  description:
    "Upload your resume to generate authentic interview questions tailored specifically to your highlighted projects, internships, and technical stack.",
  alternates: { canonical: "/resume-based-interview" },
};

export default function ResumeBasedInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="Resume-Based Mock Interview Preparation"
        description="Interviewers never ask generic questions when reviewing a resume. MockMate AI parses your uploaded resume to grill you on your actual projects, architectural decisions, and tools."
        breadcrumb={[{ label: "Resume-Based Interview" }]}
      >
        <div className="mt-6">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">Upload Resume & Start Practice</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <FileSearch className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">Deep Project Parsing</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Extracts tech stacks, databases, libraries, and project claims from your PDF or DOCX resume.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Target className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Realistic Questioning</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Questions like &apos;Why did you choose PostgreSQL over MongoDB for this project?&apos; and
              &apos;How did you resolve this specific performance bottleneck?&apos;
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Sparkles className="size-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Private & Compliant</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Your resume is stored privately in encrypted storage and can be permanently deleted anytime.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
