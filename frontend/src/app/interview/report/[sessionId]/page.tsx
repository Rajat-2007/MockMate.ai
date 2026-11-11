"use client";

import { useMemo, use, Suspense } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Lightbulb,
  MessageSquare,
  Play,
  Printer,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocalStorageSnapshot } from "@/lib/use-local-storage-snapshot";
import {
  evaluateInterviewAnswers,
  type InterviewAnswer,
  type InterviewScores,
  type QuestionAnalysis,
} from "@/lib/interview-evaluation";

type SessionReport = {
  sessionId: string;
  category: string;
  role: string;
  course: string;
  date: string;
  duration: string;
  language: string;
  scores: InterviewScores;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  qaList: QuestionAnalysis[];
  evaluationMethod: "ai" | "practice_rubric" | "unavailable";
};

type StoredSessionData = Partial<Omit<SessionReport, "scores">> & {
  scores?: Partial<InterviewScores>;
  answers?: InterviewAnswer[];
};

export default function InterviewReportPage(props: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8faff] flex items-center justify-center text-xs text-muted-foreground">
          Loading Performance Evaluation...
        </div>
      }
    >
      <InterviewReportInner {...props} />
    </Suspense>
  );
}

function InterviewReportInner({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;
  const { profile } = useAuth();
  const savedSession = useLocalStorageSnapshot(`mockmate_session_${sessionId}`);
  const isLoading = savedSession === undefined;
  const sessionData = useMemo(() => {
    if (!savedSession) {
      return null;
    }

    try {
      return JSON.parse(savedSession) as StoredSessionData;
    } catch (error) {
      console.error("Could not load interview report:", error);
      return null;
    }
  }, [savedSession]);

  const answers = Array.isArray(sessionData?.answers) ? sessionData.answers : [];
  const generatedEvaluation =
    sessionData?.evaluationMethod === "ai" ||
    sessionData?.evaluationMethod === "practice_rubric" ||
    answers.length === 0
      ? undefined
      : evaluateInterviewAnswers(answers);
  const fallbackReport: SessionReport = {
    sessionId,
    category: sessionData?.category || "Interview",
    role: sessionData?.role || profile?.target_role || "Candidate",
    course: sessionData?.course || profile?.course || "Academic Stream",
    date: sessionData?.date || "Unknown",
    duration: sessionData?.duration || "Unknown",
    language: sessionData?.language || "English",
    scores: {
      overall: 0,
      knowledge: 0,
      structure: 0,
      communication: 0,
      problemSolving: 0,
      relevance: 0,
    },
    strongAreas: [],
    weakAreas: [],
    recommendations: [],
    qaList: [],
    evaluationMethod: "unavailable",
  };
  const report: SessionReport = {
    ...fallbackReport,
    ...(sessionData ?? {}),
    scores: {
      overall:
        generatedEvaluation?.scores.overall ??
        sessionData?.scores?.overall ??
        0,
      knowledge:
        generatedEvaluation?.scores.knowledge ??
        sessionData?.scores?.knowledge ??
        0,
      structure:
        generatedEvaluation?.scores.structure ??
        sessionData?.scores?.structure ??
        0,
      communication:
        generatedEvaluation?.scores.communication ??
        sessionData?.scores?.communication ??
        0,
      problemSolving:
        generatedEvaluation?.scores.problemSolving ??
        sessionData?.scores?.problemSolving ??
        0,
      relevance:
        generatedEvaluation?.scores.relevance ??
        sessionData?.scores?.relevance ??
        0,
    },
    strongAreas:
      generatedEvaluation?.strongAreas ??
      (Array.isArray(sessionData?.strongAreas) ? sessionData.strongAreas : []),
    weakAreas:
      generatedEvaluation?.weakAreas ??
      (Array.isArray(sessionData?.weakAreas) ? sessionData.weakAreas : []),
    recommendations:
      generatedEvaluation?.recommendations ??
      (Array.isArray(sessionData?.recommendations)
        ? sessionData.recommendations
        : []),
    qaList:
      generatedEvaluation?.qaList ??
      (Array.isArray(sessionData?.qaList) ? sessionData.qaList : []),
    evaluationMethod:
      sessionData?.evaluationMethod === "ai"
        ? "ai"
        : sessionData?.evaluationMethod === "practice_rubric" ||
            generatedEvaluation
          ? "practice_rubric"
          : "unavailable",
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faff] text-sm text-muted-foreground dark:bg-[#0b1b29]">
        Loading interview report...
      </div>
    );
  }

  if (!sessionData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8faff] p-6 text-center dark:bg-[#0b1b29]">
        <h1 className="text-xl font-semibold text-foreground">Interview report not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This report is not available in this browser. Complete an interview in this browser to create a report.
        </p>
        <Button asChild>
          <Link href="/interview/setup">Start an Interview</Link>
        </Button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#0b1b29] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between pb-6 border-b border-border/80">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Link href="/dashboard" className="flex items-center gap-1">
              <ArrowLeft className="size-3.5" /> Back to Dashboard
            </Link>
          </Button>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs gap-1">
            <Printer className="size-3.5" /> Print / PDF
          </Button>
          <Button asChild size="sm" className="bg-brand-gradient hover:bg-brand-gradient text-white h-8 text-xs gap-1">
            <Link href="/interview/setup">
              <RotateCcw className="size-3.5" /> Practice Again
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Report Document */}
      <main className="mx-auto w-full max-w-5xl space-y-6 pt-6">
        {/* Title & Metadata Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-primary/20 bg-card p-6 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.7rem] font-semibold text-emerald-600">
              <CheckCircle2 className="size-3" />
              {report.evaluationMethod === "ai"
                ? "Interview Completed • AI Evaluated"
                : report.evaluationMethod === "practice_rubric"
                  ? "Interview Completed • Practice Estimate"
                  : "Interview Completed"}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Performance Evaluation Report
            </h1>
            <p className="text-xs text-muted-foreground">
              {report.category} • {report.role} • {report.date} • {report.duration}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 p-3 sm:self-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary font-bold text-white text-xl shadow-md">
              {report.scores.overall}
            </div>
            <div>
              <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider block">
                {report.evaluationMethod === "ai"
                  ? "Overall Score"
                  : "Estimated Practice Score"}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {report.evaluationMethod === "ai"
                  ? "AI evaluation"
                  : report.evaluationMethod === "practice_rubric"
                    ? "Rubric estimate"
                    : "Not scored"}
              </span>
            </div>
          </div>
        </div>

        {/* Rubric Dimension Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Answer Detail", val: report.scores.knowledge, color: "bg-primary" },
            { label: "Answer Structure", val: report.scores.structure, color: "bg-blue-600" },
            { label: "Communication", val: report.scores.communication, color: "bg-emerald-600" },
            { label: "Actions & Outcomes", val: report.scores.problemSolving, color: "bg-purple-600" },
            { label: "Relevance & Focus", val: report.scores.relevance, color: "bg-amber-600" },
          ].map((item) => (
            <Card key={item.label} className="p-3 border-border/80">
              <span className="text-[0.68rem] font-medium text-muted-foreground block line-clamp-1">
                {item.label}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">{item.val}</span>
                <span className="text-[0.65rem] text-muted-foreground">/ 10</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.val * 10}%` }}
                />
              </div>
            </Card>
          ))}
        </div>

        {report.evaluationMethod === "practice_rubric" && (
          <p className="text-xs text-muted-foreground">
            These approximate scores use answer length, organization, question-word overlap, and action terms. They do not verify factual accuracy and are not AI-generated.
          </p>
        )}

        {/* Strong vs Weak Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strong Areas */}
          <Card className="border-border/80 bg-emerald-50/20 dark:bg-emerald-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" /> Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {report.strongAreas.length === 0 && (
                <p className="text-muted-foreground">No strengths were recorded for this session.</p>
              )}
              {report.strongAreas.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <p className="text-foreground/90 leading-relaxed">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weak Areas */}
          <Card className="border-border/80 bg-amber-50/20 dark:bg-amber-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" /> Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {report.weakAreas.length === 0 && (
                <p className="text-muted-foreground">No improvement areas were recorded for this session.</p>
              )}
              {report.weakAreas.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <p className="text-foreground/90 leading-relaxed">{w}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actionable Recommendations */}
        <Card className="border-border/80 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" />
              {report.evaluationMethod === "ai"
                ? "AI Recommendations"
                : "Practice Recommendations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {report.recommendations.length === 0 && (
              <p className="text-muted-foreground">No recommendations are available for this session.</p>
            )}
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-semibold text-primary">{idx + 1}.</span>
                <p className="text-foreground/90 leading-relaxed">{rec}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Question-by-Question Detailed Breakdown */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" /> Question-by-Question Analysis
          </h2>

          <div className="space-y-4">
            {report.qaList.length === 0 && (
              <p className="text-sm text-muted-foreground">No answers were recorded for this session.</p>
            )}
            {report.qaList.map((item, idx) => (
              <Card key={idx} className="border-border/80 overflow-hidden">
                <div className="bg-muted/40 p-4 border-b border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[0.65rem] font-bold uppercase text-primary tracking-wider">
                      Question {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground leading-snug">
                      {item.question}
                    </h3>
                  </div>
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary shrink-0 ml-3">
                    {item.score}
                  </span>
                </div>

                <CardContent className="p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Your Answer:
                    </span>
                    <p className="rounded-md bg-muted/30 p-2.5 text-foreground leading-relaxed">
                      &ldquo;{item.yourAnswer}&rdquo;
                    </p>
                  </div>

                  <div>
                    <span className="text-[0.68rem] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                      {report.evaluationMethod === "ai"
                        ? "AI Interview Feedback:"
                        : "Practice Rubric Feedback:"}
                    </span>
                    <p className="text-muted-foreground leading-relaxed">{item.critique}</p>
                  </div>

                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                    <span className="text-[0.68rem] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Sparkles className="size-3" />
                      {report.evaluationMethod === "ai"
                        ? "Suggested Stronger Answer:"
                        : "Answer Improvement Tip:"}
                    </span>
                    <p className="text-foreground/90 leading-relaxed">{item.betterAnswer}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-6 text-center space-y-3">
          <h3 className="text-base font-bold text-foreground">Ready to improve your score?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Take another round focusing on the weak areas identified above to track your upward trajectory.
          </p>
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/interview/setup">Start Next Practice Round →</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
