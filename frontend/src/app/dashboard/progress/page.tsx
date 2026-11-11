"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

export default function ProgressPage() {
  const { profile } = useAuth();

  const metrics = [
    { label: "Subject Knowledge", current: 8.5, previous: 7.8, gain: "+0.7" },
    { label: "Answer Structure (STAR)", current: 7.6, previous: 6.9, gain: "+0.7" },
    { label: "Communication & Clarity", current: 8.8, previous: 8.4, gain: "+0.4" },
    { label: "Problem Solving Logic", current: 8.2, previous: 7.5, gain: "+0.7" },
    { label: "Relevance & Directness", current: 8.4, previous: 7.9, gain: "+0.5" },
  ];

  const attemptsHistory = [
    { attempt: "Session 1", date: "Nov 3", score: 7.1 },
    { attempt: "Session 2", date: "Nov 5", score: 7.5 },
    { attempt: "Session 3", date: "Nov 8", score: 7.7 },
    { attempt: "Session 4", date: "Today", score: 8.2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Performance Analytics & Growth Tracker
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Track how your oral explanations, technical correctness and interview confidence evolve over time.
        </p>
      </div>

      {/* Trajectory Header Card */}
      <Card className="border-border/80 bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <TrendingUp className="size-4" /> Consistent Upward Trend
            </span>
            <h2 className="text-lg font-bold text-foreground">
              Your overall score increased by +1.1 points across 4 attempts
            </h2>
            <p className="text-xs text-muted-foreground">
              Target role: {profile?.target_role || "Candidate"} • Benchmark: Top 16% in cohort
            </p>
          </div>

          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white text-xs">
            <Link href="/interview/setup">Start Next Practice</Link>
          </Button>
        </div>
      </Card>

      {/* Score Evolution Bar Chart */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Score Progression Across Sessions</CardTitle>
          <CardDescription className="text-xs">
            Average score on each completed mock interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 h-48 items-end pt-8 pb-4 border-b border-border/60">
            {attemptsHistory.map((item) => {
              const heightPercent = (item.score / 10) * 100;
              return (
                <div key={item.attempt} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-xs font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {item.score}
                  </span>
                  <div className="w-full max-w-[4rem] bg-muted rounded-t-md overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-primary rounded-t-md transition-all duration-500 group-hover:bg-primary/90"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[0.68rem] text-muted-foreground font-medium mt-2">
                    {item.attempt}
                  </span>
                  <span className="text-[0.6rem] text-muted-foreground">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rubric Breakdown Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Rubric Dimensions & Gain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4 border-border/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{metric.label}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600">
                  {metric.gain}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Current: <b className="text-foreground">{metric.current} / 10</b></span>
                <span className="text-muted-foreground">Started at: {metric.previous}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${metric.current * 10}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
