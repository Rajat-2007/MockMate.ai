import {
  Braces,
  Briefcase,
  Calculator,
  Compass,
  Cpu,
  FileText,
  FlaskConical,
  Scale,
  Stethoscope,
  Users,
} from "lucide-react";

import type {
  Capability,
  FaqItem,
  InterviewCategory,
  InterviewLanguage,
  InterviewerPersonality,
  Plan,
  PlanLimit,
  ProcessStep,
  ProductFeature,
  SessionPreview,
} from "@/types/marketing";

/**
 * Marketing content for the public site. Kept as typed data so the same copy
 * feeds the homepage, the pricing page and structured data without drift.
 *
 * Rule: nothing in here may claim user counts, success rates, testimonials,
 * placements or partnerships. Only product facts.
 */

export const capabilities: Capability[] = [
  { value: "10", label: "interview categories" },
  { value: "11", label: "interview languages" },
  { value: "6", label: "interviewer personalities" },
  { value: "5", label: "questions per round" },
];

export const processSteps: ProcessStep[] = [
  {
    order: 1,
    title: "Create your profile",
    description: "Course, year of study, experience level and target role.",
  },
  {
    order: 2,
    title: "Choose your career goal",
    description:
      "Interview category and role, from BCA fresher to credit analyst.",
  },
  {
    order: 3,
    title: "Select your interview language",
    description:
      "English, Hindi, Hinglish or any of the eight other supported languages.",
  },
  {
    order: 4,
    title: "Start your AI interview",
    description:
      "Speak or type as the AI asks questions tailored to your selected role and difficulty.",
  },
  {
    order: 5,
    title: "Receive your performance report",
    description:
      "Rubric scores, missed concepts, better answers and the next interview to try.",
  },
];

export const interviewCategories: InterviewCategory[] = [
  {
    slug: "technical",
    name: "Technical",
    scope: "Branch subjects, fundamentals, final-year projects",
    href: "/technical-interview",
    icon: Cpu,
  },
  {
    slug: "hr",
    name: "HR",
    scope: "Motivation, teamwork, salary and notice period",
    href: "/hr-interview",
    icon: Users,
  },
  {
    slug: "resume",
    name: "Project deep-dive",
    scope: "Discuss your projects, decisions, and technologies",
    href: "/features",
    icon: FileText,
  },
  {
    slug: "coding",
    name: "Coding",
    scope: "Data structures, algorithms, and problem-solving concepts",
    href: "/coding-interview",
    icon: Braces,
  },
  {
    slug: "management",
    name: "Management",
    scope: "Marketing, finance, operations and case studies",
    href: "/features",
    icon: Briefcase,
  },
  {
    slug: "commerce",
    name: "Commerce",
    scope: "Accounting, taxation, banking and economics",
    href: "/interview-questions",
    icon: Calculator,
  },
  {
    slug: "science",
    name: "Science",
    scope: "Subject concepts, lab practice and research method",
    href: "/features",
    icon: FlaskConical,
  },
  {
    slug: "law",
    name: "Law",
    scope: "Legal concepts, case analysis and internships",
    href: "/features",
    icon: Scale,
  },
  {
    slug: "medical",
    name: "Medical",
    scope: "Clinical knowledge, ethics and professional scenarios",
    href: "/features",
    icon: Stethoscope,
  },
  {
    slug: "general",
    name: "General professional",
    scope: "Any role outside the nine above",
    href: "/interview-for-freshers",
    icon: Compass,
  },
];

export const interviewerPersonalities: InterviewerPersonality[] = [
  {
    slug: "friendly",
    name: "Friendly",
    tone: "Warm tone, longer answers, gentle follow-ups.",
    bestFor: "First attempts",
  },
  {
    slug: "professional",
    name: "Professional",
    tone: "Keeps to the agenda and to the clock.",
    bestFor: "Real conditions",
  },
  {
    slug: "strict",
    name: "Strict",
    tone: "Presses on thin answers and asks for evidence.",
    bestFor: "Pressure rounds",
  },
  {
    slug: "technical-expert",
    name: "Technical Expert",
    tone: "Follows project decisions down to fundamentals.",
    bestFor: "Technical rounds",
  },
  {
    slug: "hr-specialist",
    name: "HR Specialist",
    tone: "Behavioural questions, culture fit and compensation.",
    bestFor: "HR rounds",
  },
  {
    slug: "hiring-manager",
    name: "Experienced Hiring Manager",
    tone: "Panel-style trade-offs and ownership questions.",
    bestFor: "Experienced hires",
  },
];

export const interviewLanguages: InterviewLanguage[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "hi-en", label: "Hinglish", native: "Hinglish" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

export const productFeatures: ProductFeature[] = [
  {
    title: "Practice out loud, or type",
    description:
      "Use your microphone or type your response. Questions are spoken aloud when your browser supports it.",
    visual: "voice",
  },
  {
    title: "Questions for your role",
    description:
      "Start with a question set generated for your category, target role, course, and difficulty.",
    visual: "questions",
  },
  {
    title: "Set the challenge level",
    description:
      "Choose Fresher, Medium, or Hard to shape the generated question set.",
    visual: "difficulty",
  },
  {
    title: "Choose your language",
    description:
      "Practice in English, Hindi, Hinglish, or one of the other supported languages.",
    visual: "languages",
  },
  {
    title: "Get answer-by-answer feedback",
    description:
      "See AI-generated rubric scores, strengths, improvement areas, and suggestions after the round.",
    visual: "report",
  },
];

const freeLimits: PlanLimit[] = [
  { label: "AI interviews", value: "4 / month" },
  { label: "Answer mode", value: "Voice and text" },
  { label: "AI evaluation report", value: "Included" },
];

const starterLimits: PlanLimit[] = [
  { label: "AI interviews", value: "20 / month" },
  { label: "Answer mode", value: "Voice and text" },
  { label: "AI evaluation report", value: "Included" },
];

const proLimits: PlanLimit[] = [
  { label: "AI interviews", value: "60 / month" },
  { label: "Answer mode", value: "Voice and text" },
  { label: "AI evaluation report", value: "Included" },
];

export const plans: Plan[] = [
  {
    slug: "free",
    name: "Free",
    priceInr: 0,
    cadence: "/ month",
    forWhom: "For a first look at how an AI interview feels.",
    limits: freeLimits,
    cta: "Start free",
    featured: false,
  },
  {
    slug: "starter",
    name: "Starter",
    priceInr: 149,
    cadence: "/ month",
    forWhom: "For final-year students and freshers in placement season.",
    limits: starterLimits,
    cta: "Choose Starter",
    featured: true,
  },
  {
    slug: "pro",
    name: "Pro",
    priceInr: 499,
    cadence: "/ month",
    forWhom:
      "For working professionals switching roles or sitting multiple rounds.",
    limits: proLimits,
    cta: "Choose Pro",
    featured: false,
  },
];

export const planInclusions: string[] = [
  "AI-generated, role-tailored questions",
  "Voice and text answers",
  "AI-generated feedback and reports",
  "11 interview languages",
];

export const pricingNote =
  "Paid plans include 30 days of access per payment. UPI checkout is verified before activation.";

export const faqs: FaqItem[] = [
  {
    question: "Do I have to interview in English?",
    answer:
      "No. Choose any of the 11 languages before a session, including Hinglish. Questions, follow-ups and the report stay in that language for the whole session.",
  },
  {
    question: "I am a B.Com student. Will the questions fit my course?",
    answer:
      "Yes. Commerce sessions ask about accounting, taxation, banking and economics. Management, science, law, medical and pharmacy question banks follow the same pattern for their streams.",
  },
  {
    question: "How is my answer scored?",
    answer:
      "The AI evaluates your answers against knowledge, structure, communication, problem-solving, and relevance, then provides strengths and suggestions.",
  },
  {
    question: "What happens if my connection drops mid-interview?",
    answer:
      "Interview answers are saved to this browser after you finish. If you leave before the report appears, the session cannot currently be resumed.",
  },
  {
    question: "Can I read the transcript afterwards?",
    answer:
      "Completed reports show the questions, your answers, and AI feedback. Report data is currently stored in this browser.",
  },
  {
    question: "Can I upload my resume?",
    answer:
      "Resume upload is not available yet. You can still practice project and experience questions by choosing the project deep-dive category.",
  },
  {
    question: "Does my plan renew automatically?",
    answer:
      "No. Each successful UPI payment activates 30 days of access. You can purchase again when the plan expires.",
  },
];

export const sessionPreview: SessionPreview = {
  category: "Technical",
  course: "BCA",
  difficulty: "Hard",
  timeLeft: "18:42",
  questionNumber: "Q2 / 5",
  question:
    "You mentioned a payment webhook in your project. What happens when the same event arrives twice?",
  answerPreview:
    "I store the event id before processing, so a repeat delivery fails the lookup and returns 200 without charging again",
  answerHint: "Answer in English or switch to Hindi",
  elapsed: "00:14",
  inputLevelDb: "-12 dB",
  overallScore: "7.2",
  scores: [
    { label: "Knowledge", value: 7.5 },
    { label: "Structure", value: 6 },
    { label: "Communication", value: 8 },
  ],
};
