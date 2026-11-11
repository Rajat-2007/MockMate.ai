import { apiFetch } from "@/lib/api/client";
import type {
  InterviewAnswer,
  InterviewEvaluation,
} from "@/lib/interview-evaluation";

export type GenerateQuestionsRequest = {
  category: string;
  role: string;
  course: string | null;
  difficulty: "Fresher" | "Medium" | "Hard";
  personality: string;
  language: string;
  question_count: number;
  session_nonce: string;
  recent_questions: string[];
};

export type GenerateQuestionsResponse = {
  questions: string[];
};

export type AiInterviewEvaluation = Omit<
  InterviewEvaluation,
  "evaluationMethod"
> & {
  evaluationMethod: "ai";
};

export const interviewApi = {
  generateQuestions: (body: GenerateQuestionsRequest) =>
    apiFetch<GenerateQuestionsResponse>("/api/v1/interviews/questions", {
      method: "POST",
      timeoutMs: 90_000,
      body,
    }),

  evaluate: (body: {
    category: string;
    role: string;
    language: string;
    answers: Pick<InterviewAnswer, "question" | "answer">[];
  }) =>
    apiFetch<AiInterviewEvaluation>("/api/v1/interviews/evaluate", {
      method: "POST",
      timeoutMs: 120_000,
      body,
    }),
};
