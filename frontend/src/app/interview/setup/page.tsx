"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  Check,
  CheckCircle2,
  FileText,
  Mic,
  Play,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { interviewCategories, interviewerPersonalities, interviewLanguages } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { interviewApi } from "@/lib/api/interviews";

const DIFFICULTIES = ["Fresher", "Medium", "Hard"] as const;

function questionHistoryKey(userId?: string): string {
  return `mockmate_question_history_${userId || "guest"}`;
}

function loadQuestionHistory(userId?: string): string[] {
  try {
    const saved = localStorage.getItem(questionHistoryKey(userId));
    const history: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(history)
      ? history
          .filter((question): question is string => typeof question === "string")
          .slice(-60)
      : [];
  } catch {
    return [];
  }
}

function saveQuestionHistory(userId: string | undefined, questions: string[]): void {
  localStorage.setItem(
    questionHistoryKey(userId),
    JSON.stringify([...loadQuestionHistory(userId), ...questions].slice(-60)),
  );
}

export default function InterviewSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8faff] text-sm text-muted-foreground dark:bg-[#0b1b29]">
          Loading interview setup…
        </div>
      }
    >
      <InterviewSetupInner />
    </Suspense>
  );
}

function InterviewSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, user } = useAuth();

  const [category, setCategory] = useState(() => {
    const requestedCategory =
      searchParams.get("category") || searchParams.get("mode");
    return interviewCategories.some(
      (interviewCategory) => interviewCategory.slug === requestedCategory,
    )
      ? requestedCategory!
      : "technical";
  });
  const [difficulty, setDifficulty] =
    useState<(typeof DIFFICULTIES)[number]>("Medium");
  const [duration, setDuration] = useState("15");
  const [personality, setPersonality] = useState("professional");
  const [language, setLanguage] = useState(profile?.preferred_language || "English");
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");
  const [requiresLogin, setRequiresLogin] = useState(false);

  const handleLaunch = async () => {
    if (isLaunching) return;

    setIsLaunching(true);
    setLaunchError("");
    setRequiresLogin(false);
    try {
      const { questions } = await interviewApi.generateQuestions({
        category,
        role: profile?.target_role || "Candidate",
        course: profile?.course || null,
        difficulty,
        personality,
        language,
        question_count: 12,
        session_nonce: crypto.randomUUID(),
        recent_questions: loadQuestionHistory(user?.id),
      });

      const sessionId = `mm_${Date.now()}`;
      saveQuestionHistory(user?.id, questions);
      localStorage.setItem(
        `mockmate_questions_${sessionId}`,
        JSON.stringify(questions),
      );
      const params = new URLSearchParams({
        category,
        difficulty,
        duration,
        personality,
        language,
        mode,
      });
      router.push(`/interview/session/${sessionId}?${params.toString()}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setLaunchError("Log in with a registered account to start an AI interview.");
        setRequiresLogin(true);
      } else {
        setLaunchError(
          error instanceof Error
            ? error.message
            : "Could not prepare your interview. Please try again.",
        );
      }

      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#0b1b29] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Link href="/dashboard" className="flex items-center gap-1">
              <ArrowLeft className="size-3.5" /> Back
            </Link>
          </Button>
          <Logo />
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-foreground">Interview Studio</span>
          <p className="text-[0.65rem] text-muted-foreground">Configuring AI Interrogator</p>
        </div>
      </header>

      {/* Main Setup Container */}
      <main className="mx-auto w-full max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Configure Your AI Mock Interview
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Customized for {profile?.course || "your degree"} •{" "}
              {profile?.target_role || "your career goal"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Columns: Config Options */}
            <div className="md:col-span-2 space-y-5">
              {/* 1. Category Selection */}
              <Card className="border-border/80 p-4 space-y-3">
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>1. Select Interview Category</span>
                  <span className="text-[0.68rem] font-normal text-muted-foreground">
                    10 Academic & Industry Streams
                  </span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {interviewCategories.map((cat) => {
                    const isSelected = category === cat.slug;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => setCategory(cat.slug)}
                        className={cn(
                          "flex flex-col items-start rounded-lg border p-2.5 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border/80 bg-card hover:bg-muted/50 text-muted-foreground",
                        )}
                      >
                        <div className="flex w-full items-center justify-between mb-1">
                          <Icon className="size-4 text-primary" />
                          {isSelected && <Check className="size-3 text-primary" />}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{cat.name}</span>
                        <span className="text-[0.6rem] text-muted-foreground line-clamp-1 mt-0.5">
                          {cat.scope}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 2. Difficulty & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border/80 p-4 space-y-3">
                  <Label className="text-xs font-semibold">2. Difficulty Level</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={cn(
                          "rounded-md border py-2 text-center text-xs font-semibold transition-all",
                          difficulty === lvl
                            ? "border-primary bg-primary text-white"
                            : "border-border/80 bg-card text-foreground hover:bg-muted",
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="border-border/80 p-4 space-y-3">
                  <Label className="text-xs font-semibold">3. Interview Duration</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "10", label: "10 min" },
                      { val: "15", label: "15 min" },
                      { val: "30", label: "30 min" },
                    ].map((d) => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => setDuration(d.val)}
                        className={cn(
                          "rounded-md border py-2 text-center text-xs font-semibold transition-all",
                          duration === d.val
                            ? "border-primary bg-primary text-white"
                            : "border-border/80 bg-card text-foreground hover:bg-muted",
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* 3. Interviewer Personality */}
              <Card className="border-border/80 p-4 space-y-3">
                <Label className="text-xs font-semibold">4. AI Interviewer Persona</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {interviewerPersonalities.map((p) => {
                    const isSelected = personality === p.slug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => setPersonality(p.slug)}
                        className={cn(
                          "flex flex-col items-start rounded-lg border p-2 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/80 bg-card hover:bg-muted/50",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{p.name}</span>
                          {isSelected && <Check className="size-3 text-primary" />}
                        </div>
                        <span className="text-[0.62rem] text-muted-foreground mt-0.5 line-clamp-1">
                          {p.bestFor}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 4. Language & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border/80 p-4 space-y-2">
                  <Label className="text-xs font-semibold">5. Spoken & Report Language</Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {interviewLanguages.map((l) => (
                      <option key={l.code} value={l.label}>
                        {l.label} ({l.native})
                      </option>
                    ))}
                  </select>
                </Card>

                <Card className="border-border/80 p-4 space-y-2">
                  <Label className="text-xs font-semibold">6. Interaction Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("voice")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-semibold transition-all",
                        mode === "voice"
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/80 bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      <Mic className="size-3.5" /> Voice & Mic
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("text")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-semibold transition-all",
                        mode === "text"
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/80 bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      <FileText className="size-3.5" /> Text Only
                    </button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Launch Preview & Summary */}
            <div className="space-y-4">
              <Card className="border-border/80 bg-gradient-to-b from-card to-muted/30 shadow-md">
                <CardHeader className="pb-3 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-2">
                    <BrainCircuit className="size-6" />
                  </div>
                  <CardTitle className="text-base font-bold">Session Brief</CardTitle>
                  <CardDescription className="text-xs">
                    Review your parameters before starting
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="rounded-md border border-border/60 bg-card p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-semibold capitalize text-foreground">{category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-semibold text-foreground">{difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold text-foreground">{duration} Minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <span className="font-semibold text-foreground">{language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Answer Mode:</span>
                      <span className="font-semibold capitalize text-foreground">
                        {mode === "voice" ? "Microphone & Spoken" : "Typed Text"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[0.7rem] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>AI will prepare role-specific questions and evaluate your answers when the session ends.</span>
                  </div>
                  <p className="text-[0.65rem] text-muted-foreground">
                    Your answers are sent to the configured AI provider for feedback. The report is saved in this browser.
                  </p>

                  {launchError && (
                    <div role="alert" className="space-y-1 text-xs text-destructive">
                      <p>{launchError}</p>
                      {requiresLogin && (
                        <Link className="font-semibold underline" href="/login">
                          Go to login
                        </Link>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    className="bg-brand-gradient hover:bg-brand-gradient w-full text-white font-semibold shadow-lg shadow-indigo-500/20 py-5 transition-all hover:scale-[1.02]"
                  >
                    {isLaunching ? (
                      <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <Play className="mr-2 size-4 fill-white" />
                    )}
                    {isLaunching ? "Preparing Questions..." : "Start Live Interview"}
                  </Button>

                  <p className="text-center text-[0.65rem] text-muted-foreground">
                    Your completed report will be saved in this browser.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground pt-6">
        MockMate AI • Built for high-stakes placement and job interviews.
      </footer>
    </div>
  );
}
