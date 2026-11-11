import type { LucideIcon } from "lucide-react";

export type InterviewCategory = {
  slug: string;
  name: string;
  scope: string;
  href: string;
  icon: LucideIcon;
};

export type InterviewerPersonality = {
  slug: string;
  name: string;
  tone: string;
  bestFor: string;
};

export type InterviewLanguage = {
  code: string;
  label: string;
  native: string;
};

export type ProcessStep = {
  order: number;
  title: string;
  description: string;
};

export type Capability = {
  value: string;
  label: string;
};

export type FeatureVisual =
  | "voice"
  | "questions"
  | "difficulty"
  | "languages"
  | "report";

export type ProductFeature = {
  title: string;
  description: string;
  visual: FeatureVisual;
};

export type PlanLimit = {
  label: string;
  value: string;
};

export type Plan = {
  slug: string;
  name: string;
  priceInr: number;
  cadence: string;
  forWhom: string;
  limits: PlanLimit[];
  cta: string;
  featured: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ScoreReadout = {
  label: string;
  value: number;
};

export type SessionPreview = {
  category: string;
  course: string;
  difficulty: string;
  timeLeft: string;
  questionNumber: string;
  question: string;
  answerPreview: string;
  answerHint: string;
  elapsed: string;
  inputLevelDb: string;
  overallScore: string;
  scores: ScoreReadout[];
};
