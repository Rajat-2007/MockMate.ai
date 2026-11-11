
"use client";

import {
  useEffect,
  useRef,
  useState,
  use,
  Suspense,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  Clock,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { interviewApi } from "@/lib/api/interviews";
import { ApiError } from "@/lib/api/client";
import type {
  InterviewAnswer,
  InterviewScores,
  QuestionAnalysis,
} from "@/lib/interview-evaluation";

type SessionState = {
  sessionId: string;
  category: string;
  role: string;
  course: string;
  date: string;
  duration: string;
  language: string;
  answers: InterviewAnswer[];
  scores: InterviewScores;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  qaList: QuestionAnalysis[];
  evaluationMethod: "ai";
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0?: { transcript?: string };
  }>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function isQuestionList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((question: unknown) => typeof question === "string")
  );
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function InterviewSessionPage(props: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b1b29] flex items-center justify-center text-white text-xs">
          Loading AI Interview Studio...
        </div>
      }
    >
      <InterviewSessionInner {...props} />
    </Suspense>
  );
}

function InterviewSessionInner({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const targetRole = profile?.target_role || "Candidate";
  const course = profile?.course || "Academic Stream";

  const category = searchParams.get("category") || "technical";

  const requestedDuration = Number(searchParams.get("duration") || 15);
  const durationMinutes =
    Number.isFinite(requestedDuration) && requestedDuration > 0
      ? Math.min(requestedDuration, 180)
      : 15;

  const language = searchParams.get("language") || "English";
  const initialMode = searchParams.get("mode") || "voice";

  const [questions, setQuestions] = useState<string[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [sessionLoadError, setSessionLoadError] = useState("");

  // States
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");
  const [answersHistory, setAnswersHistory] = useState<InterviewAnswer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");

  // Refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finishStartedRef = useRef(false);
  const timerExpiredRef = useRef(false);
  const interviewStartedAtRef = useRef(0);
  const interviewDeadlineRef = useRef(0);

  // Keep latest state accessible to timer and callbacks.
  const latestStateRef = useRef({
    currentQIndex,
    answerDraft,
    transcript,
    answersHistory,
    secondsLeft,
  });

  useEffect(() => {
    latestStateRef.current = {
      currentQIndex,
      answerDraft,
      transcript,
      answersHistory,
      secondsLeft,
    };
  }, [currentQIndex, answerDraft, transcript, answersHistory, secondsLeft]);

  const currentQuestion = questions[currentQIndex] || questions[0];

  useEffect(() => {
    let restoredQuestions: string[] | null = null;
    let loadError = "";
    try {
      const savedQuestions = localStorage.getItem(
        `mockmate_questions_${sessionId}`
      );
      if (savedQuestions) {
        const parsed: unknown = JSON.parse(savedQuestions);
        if (isQuestionList(parsed)) {
          restoredQuestions = parsed;
        } else {
          throw new Error("Interview questions are invalid.");
        }
      } else {
        throw new Error("Generated interview questions were not found.");
      }
    } catch (error) {
      console.error("Could not load generated interview questions:", error);
      loadError =
        "Your generated questions could not be loaded. Return to setup to create a fresh question set.";
    }

    const timer = window.setTimeout(() => {
      if (restoredQuestions) {
        setQuestions(restoredQuestions);
      }
      if (loadError) {
        setSessionLoadError(loadError);
      }
      setQuestionsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [sessionId]);

  // Stop microphone safely.
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }

      recognitionRef.current = null;
    }

    setIsListening(false);
  }, []);

  // Start speech recognition.
  const startListening = useCallback(() => {
    if (typeof window === "undefined" || finishStartedRef.current) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language.toLowerCase().includes("hindi")
        ? "hi-IN"
        : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: {
        resultIndex: number;
        results: ArrayLike<{
          isFinal: boolean;
          0?: { transcript?: string };
        }>;
      }) => {
        let interimTranscript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const result = event.results[i];
          const spokenText = result[0]?.transcript || "";

          if (result.isFinal) {
            setAnswerDraft((prev) =>
              `${prev} ${spokenText}`.trim()
            );
          } else {
            interimTranscript += spokenText;
          }
        }

        setTranscript(interimTranscript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }

        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error("Speech recognition error:", error);
      setIsListening(false);
    }
  }, [language]);

  // Stop microphone and speech synthesis when component unmounts.
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors.
        }
      }

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Complete interview safely.
  const handleConclude = useCallback(
    async (finalAnswers?: InterviewAnswer[]) => {
      if (finishStartedRef.current) {
        return;
      }

      finishStartedRef.current = true;
      setIsFinishing(true);
      setFinishError("");

      stopListening();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }

      try {
        const latest = latestStateRef.current;

        const remainingAnswer = (
          latest.answerDraft + " " + latest.transcript
        ).trim();

        const currentAnswer: InterviewAnswer = {
          question: questions[latest.currentQIndex],
          answer: remainingAnswer || "No answer provided.",
          timestamp: new Date().toLocaleTimeString(),
        };

        const completedAnswers =
          finalAnswers ?? [...latest.answersHistory, currentAnswer];

        const elapsedSeconds = Math.max(
          0,
          Math.floor((Date.now() - interviewStartedAtRef.current) / 1000)
        );
        const elapsedMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
        const evaluation = await interviewApi.evaluate({
          category,
          role: targetRole,
          language,
          answers: completedAnswers.map(({ question, answer }) => ({
            question,
            answer,
          })),
        });

        const sessionRecord: SessionState = {
          sessionId,
          category,
          role: targetRole,
          course,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          duration: `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"}`,
          language,
          answers: completedAnswers,
          ...evaluation,
        };

        localStorage.setItem(
          `mockmate_session_${sessionId}`,
          JSON.stringify(sessionRecord)
        );
        localStorage.removeItem(`mockmate_questions_${sessionId}`);

        router.push(`/interview/report/${sessionId}`);
      } catch (error) {
        console.error("Interview completion error:", error);

        finishStartedRef.current = false;
        setIsFinishing(false);
        setFinishError(
          error instanceof ApiError
            ? error.message
            : "Could not evaluate and save your interview. Please try again."
        );
      }
    },
    [
      category,
      course,
      language,
      questions,
      router,
      sessionId,
      stopListening,
      targetRole,
    ]
  );

  // Keep the latest conclude handler available to timer.
  const concludeRef = useRef<
    ((finalAnswers?: InterviewAnswer[]) => Promise<void>) | null
  >(null);

  useEffect(() => {
    concludeRef.current = handleConclude;
  }, [handleConclude]);

  // Safe countdown timer.
  useEffect(() => {
    if (!questionsLoaded || sessionLoadError) return;

    const startedAt = Date.now();
    interviewStartedAtRef.current = startedAt;
    interviewDeadlineRef.current =
      startedAt + durationMinutes * 60 * 1000;

    const timer = window.setInterval(() => {
      if (finishStartedRef.current) {
        return;
      }

      const currentSeconds = Math.max(
        0,
        Math.ceil((interviewDeadlineRef.current - Date.now()) / 1000)
      );
      latestStateRef.current.secondsLeft = currentSeconds;
      setSecondsLeft(currentSeconds);

      if (currentSeconds === 0 && !timerExpiredRef.current) {
        timerExpiredRef.current = true;
        concludeRef.current?.();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [durationMinutes, questionsLoaded, sessionLoadError]);

  // Text-to-speech for questions.
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      finishStartedRef.current ||
      !questionsLoaded ||
      sessionLoadError ||
      !currentQuestion
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion);

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);

      if (
        initialMode === "voice" &&
        !finishStartedRef.current
      ) {
        startListening();
      }
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [
    currentQuestion,
    initialMode,
    questionsLoaded,
    sessionLoadError,
    startListening,
  ]);

  // Toggle microphone.
  const toggleMic = () => {
    if (isFinishing) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Submit current answer and move to next question.
  const handleNextQuestion = () => {
    if (finishStartedRef.current || isFinishing) {
      return;
    }

    stopListening();

    const latest = latestStateRef.current;

    const finalAnswer = (
      latest.answerDraft + " " + latest.transcript
    ).trim();

    const answerRecord: InterviewAnswer = {
      question: questions[latest.currentQIndex],
      answer: finalAnswer || "No answer provided.",
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedAnswers = [
      ...latest.answersHistory,
      answerRecord,
    ];
    const nextQuestionIndex = (latest.currentQIndex + 1) % questions.length;

    latestStateRef.current = {
      ...latest,
      currentQIndex: nextQuestionIndex,
      answerDraft: "",
      transcript: "",
      answersHistory: updatedAnswers,
    };

    setAnswersHistory(updatedAnswers);
    setAnswerDraft("");
    setTranscript("");
    setCurrentQIndex(nextQuestionIndex);

    if (updatedAnswers.length >= 20) {
      latestStateRef.current = {
        ...latestStateRef.current,
        answersHistory: updatedAnswers,
      };
      void handleConclude(updatedAnswers);
    }
  };

  // Repeat current question.
  const handleRepeatQuestion = () => {
    if (
      isFinishing ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion);

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Timer display.
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const timeFormatted =
    `${minutes.toString().padStart(2, "0")}:` +
    `${seconds.toString().padStart(2, "0")}`;

  if (!questionsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1b29] text-white">
        <p className="text-sm text-white/75">Loading your prepared questions…</p>
      </div>
    );
  }

  if (sessionLoadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1b29] px-4 text-white">
        <div className="max-w-md space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <Logo className="mx-auto" />
          <h1 className="text-lg font-semibold">Interview questions unavailable</h1>
          <p role="alert" className="text-sm text-white/70">
            {sessionLoadError}
          </p>
          <Button onClick={() => router.push("/interview/setup")}>
            Create a fresh question set
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0b1b29] text-white">

      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-4 sm:px-6">

        <div className="flex items-center gap-3">
          <Logo />

          <span className="hidden sm:inline-block rounded bg-primary/20 px-2 py-0.5 text-[0.65rem] font-bold text-primary-foreground uppercase">
            Live Round: {category}
          </span>
        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-mono">

            <Clock className="size-3.5 text-primary" />

            <span
              className={
                secondsLeft < 180
                  ? "text-destructive font-bold"
                  : "text-white/90"
              }
            >
              {timeFormatted}
            </span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            disabled={isFinishing}
            onClick={() => handleConclude()}
            className="h-8 gap-1 text-xs bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="size-3.5" />
            End Interview
          </Button>

        </div>
      </header>

      {/* Main Interview */}
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">

        {/* Interview Stage */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* Question Counter */}
          <div className="flex items-center justify-between">

            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Question {currentQIndex + 1} of {questions.length}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={isFinishing}
              onClick={handleRepeatQuestion}
              className="h-7 border-white/15 bg-white/5 text-xs text-white hover:bg-white/10"
            >
              <RotateCcw className="mr-1 size-3" />
              Repeat Question
            </Button>

          </div>

          {sessionLoadError && (
            <p role="status" className="mx-auto mt-3 max-w-2xl text-xs text-amber-300">
              {sessionLoadError}
            </p>
          )}

          {/* AI Avatar */}
          <div className="my-auto flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto py-6">

            <div className="relative">

              <div
                className={cn(
                  "size-24 sm:size-28 rounded-full flex items-center justify-center transition-all duration-300",
                  isAiSpeaking
                    ? "bg-primary shadow-[0_0_50px_rgba(79,70,229,0.7)] scale-105"
                    : "bg-white/10 border border-white/20"
                )}
              >
                <Bot className="size-12 text-white" />
              </div>

              {isAiSpeaking && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white shadow-md animate-pulse">
                  Speaking
                </div>
              )}

            </div>

            {/* Waveform */}
            <div className="flex items-center gap-1 h-6">

              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1 rounded-full bg-primary transition-all duration-150",
                    isAiSpeaking
                      ? "animate-pulse"
                      : "h-1 opacity-25"
                  )}
                  style={{
                    height: isAiSpeaking
                      ? `${Math.sin(i) * 14 + 16}px`
                      : "4px",
                  }}
                />
              ))}

            </div>

            {/* Current Question */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-md">

              <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-white">
                &ldquo;{currentQuestion}&rdquo;
              </p>

            </div>

          </div>

          {/* Answer Input */}
          <div className="space-y-3 max-w-2xl mx-auto w-full">

            {/* Live Transcript */}
            <div className="rounded-lg border border-white/15 bg-white/[0.06] p-3 text-xs min-h-[4rem] max-h-28 overflow-y-auto">

              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-white/40 block mb-1">
                Your Answer ({isListening ? "Listening..." : "Microphone Idle"}):
              </span>

              <p className="text-white/90 leading-relaxed">

                {answerDraft || transcript ? (
                  <>
                    {answerDraft}{" "}
                    <span className="text-primary-foreground underline">
                      {transcript}
                    </span>
                  </>
                ) : (
                  <span className="text-white/40 italic">
                    Click the microphone below to speak, or type your answer in the box...
                  </span>
                )}

              </p>
            </div>

            {/* Error message */}
            {finishError && (
              <p className="text-xs text-red-400">
                {finishError}
              </p>
            )}

            {/* Input Controls */}
            <div className="flex items-center gap-2">

              <Button
                type="button"
                size="icon"
                disabled={isFinishing}
                onClick={toggleMic}
                className={cn(
                  "size-12 shrink-0 rounded-full transition-all shadow-md",
                  isListening
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                    : "bg-primary hover:bg-primary/90 text-white"
                )}
                aria-label={
                  isListening ? "Mute microphone" : "Unmute microphone"
                }
              >
                {isListening ? (
                  <MicOff className="size-5" />
                ) : (
                  <Mic className="size-5" />
                )}
              </Button>

              <input
                type="text"
                value={answerDraft}
                disabled={isFinishing}
                onChange={(e) => setAnswerDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNextQuestion();
                  }
                }}
                placeholder="Or type your thoughts here..."
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />

              <Button
                type="button"
                disabled={isFinishing}
                onClick={handleNextQuestion}
                className="bg-brand-gradient hover:bg-brand-gradient h-12 rounded-full px-5 text-xs text-white font-semibold shadow-md"
              >
                Submit
                <Send className="ml-1.5 size-3.5" />
              </Button>

            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:flex w-80 flex-col border-l border-white/10 bg-white/[0.02] p-4 justify-between">

          <div className="space-y-4">

            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50 border-b border-white/10 pb-2">
              Interview Transcript
            </h2>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1 text-xs">

              {answersHistory.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  Your spoken and typed answers will appear here as you submit each question.
                </div>
              ) : (
                answersHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-3 space-y-1.5"
                  >

                    <span className="text-[0.65rem] font-bold text-primary block">
                      Q{idx + 1}: {item.question}
                    </span>

                    <p className="text-[0.72rem] text-white/80 leading-relaxed">
                      {item.answer}
                    </p>

                    <span className="text-[0.6rem] text-white/40 block text-right">
                      {item.timestamp}
                    </span>

                  </div>
                ))
              )}

            </div>
          </div>

          {/* Evaluation Info */}
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-[0.7rem] text-white/60 space-y-1">

            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              AI Evaluation Ready
            </div>

            <p>
              Your submitted answers will be sent for AI feedback when the interview ends.
            </p>

          </div>

        </aside>
      </main>

      {/* Finishing Overlay */}
      {isFinishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b29]/90 backdrop-blur-sm">

          <div className="text-center space-y-3">

            <div className="mx-auto size-10 rounded-full border-4 border-white/20 border-t-primary animate-spin" />

            <h2 className="text-lg font-semibold text-white">
              Evaluating Your Answers
            </h2>

            <p className="text-xs text-white/60">
              Please wait while the AI prepares your report...
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
