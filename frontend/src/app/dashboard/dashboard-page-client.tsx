"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Play,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { billingApi, type BillingStatus } from "@/lib/api/billing";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [billingStatusError, setBillingStatusError] = useState(false);

  useEffect(() => {
    billingApi
      .status()
      .then(setBillingStatus)
      .catch(() => setBillingStatusError(true));
  }, []);

  const mockStats = {
    interviewsCompleted: 4,
    avgScore: 7.8,
    totalMinutes: 72,
    percentile: 84,
  };

  const recentSessions = [
    {
      id: "demo-sess-1",
      category: "Technical & DSA",
      role: profile?.target_role || "Software Engineer",
      date: "Today, 4:30 PM",
      score: 8.2,
      duration: "18 mins",
      language: profile?.preferred_language || "English",
      status: "Completed",
    },
    {
      id: "demo-sess-2",
      category: "HR & Behavioral",
      role: profile?.target_role || "Associate",
      date: "Yesterday",
      score: 7.5,
      duration: "15 mins",
      language: "Hinglish",
      status: "Completed",
    },
    {
      id: "demo-sess-3",
      category: "Resume Project Deep-Dive",
      role: profile?.course || "BCA / Tech",
      date: "2 days ago",
      score: 7.7,
      duration: "20 mins",
      language: "English",
      status: "Completed",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[0.7rem] font-semibold text-primary">
              <Sparkles className="size-3" /> Ready for placement season
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.full_name?.split(" ")[0] || "Student"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Practicing for{" "}
              <span className="font-semibold text-foreground">
                {profile?.target_role || "your target career"}
              </span>{" "}
              ({profile?.course || "Academic Stream"})
            </p>
          </div>

          <Button
            asChild
            className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md transition-all hover:scale-[1.02] sm:self-center"
          >
            <Link href="/interview/setup" className="flex items-center gap-2">
              <Play className="size-4 fill-white" /> Start Mock Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Interviews Done</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{mockStats.interviewsCompleted}</span>
            <span className="text-[0.68rem] text-muted-foreground">sessions</span>
          </div>
          <p className="mt-1 text-[0.68rem] text-emerald-600 font-medium">
            {billingStatus?.is_founder
              ? "Unlimited founder access"
              : billingStatus
                ? `${billingStatus.remaining_interviews ?? 0} ${billingStatus.plan} interviews remaining this month`
                : billingStatusError
                  ? "Could not load interview quota"
                  : "Checking monthly quota…"}
          </p>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Average Score</span>
            <Award className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{mockStats.avgScore}</span>
            <span className="text-[0.68rem] text-muted-foreground">/ 10</span>
          </div>
          <p className="mt-1 text-[0.68rem] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="size-3" /> +0.6 over last 3 rounds
          </p>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Practice Time</span>
            <Clock className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{mockStats.totalMinutes}</span>
            <span className="text-[0.68rem] text-muted-foreground">minutes</span>
          </div>
          <p className="mt-1 text-[0.68rem] text-muted-foreground">
            Voice & text speaking rounds
          </p>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Peer Percentile</span>
            <BarChart3 className="size-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">Top {100 - mockStats.percentile}%</span>
          </div>
          <p className="mt-1 text-[0.68rem] text-primary font-medium">
            Higher than 84% of candidates
          </p>
        </Card>
      </div>

      {/* Quick Launch Interview Modes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Choose Interview Mode</h2>
          <Link href="/interview/setup" className="text-xs font-medium text-primary hover:underline">
            Custom setup →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/interview/setup?category=technical"
            className="group block rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Technical Round</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Branch fundamentals, projects, and domain problem solving for {profile?.course || "your degree"}.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-primary">
              Launch session <ArrowRight className="size-3" />
            </span>
          </Link>

          <Link
            href="/interview/setup?category=hr"
            className="group block rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">HR & Behavioral</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Tell me about yourself, teamwork, conflict resolution, strengths, and salary questions.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-emerald-600">
              Launch session <ArrowRight className="size-3" />
            </span>
          </Link>

          <Link
            href="/interview/setup?category=resume"
            className="group block rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Project Deep-Dive</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Practice explaining project decisions, tools, trade-offs, and outcomes.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-purple-600">
              Launch session <ArrowRight className="size-3" />
            </span>
          </Link>

          <Link
            href="/interview/setup?category=coding"
            className="group block rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Code2 className="size-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Coding Concepts</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Explain algorithms, data structures, and problem-solving trade-offs in an interview.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-amber-600">
              Launch session <ArrowRight className="size-3" />
            </span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Interviews & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Interviews (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Interview Sessions</h2>
            <Link href="/dashboard/history" className="text-xs text-primary hover:underline">
              View all history →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-4 transition-colors hover:border-border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {session.category}
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-primary">
                      {session.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" /> {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {session.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center">
                  <div className="text-right">
                    <div className="text-base font-bold text-foreground">
                      {session.score} <span className="text-xs font-normal text-muted-foreground">/ 10</span>
                    </div>
                    <span className="text-[0.65rem] text-emerald-600 font-medium">Scored Report</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link href={`/interview/report/${session.id}`}>
                      View Report
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Rubric & Recommendations (1 col) */}
        <div className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Skill Analysis</CardTitle>
              <CardDescription className="text-xs">
                Aggregated from your interview evaluations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Subject Knowledge</span>
                  <span className="font-semibold">8.0 / 10</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "80%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Answer Structure & STAR</span>
                  <span className="font-semibold">7.2 / 10</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Communication Clarity</span>
                  <span className="font-semibold">8.5 / 10</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Problem Solving Logic</span>
                  <span className="font-semibold">7.4 / 10</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "74%" }} />
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-[0.72rem] text-amber-900 dark:text-amber-200 border border-amber-500/20">
                <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="size-3.5" /> Weak Area to Improve:
                </div>
                Focus on framing behavioral questions using the STAR framework (Situation, Task, Action, Result).
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
