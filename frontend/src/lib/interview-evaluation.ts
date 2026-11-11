export type InterviewAnswer = {
  question: string;
  answer: string;
  timestamp: string;
};

export type InterviewScores = {
  overall: number;
  knowledge: number;
  structure: number;
  communication: number;
  problemSolving: number;
  relevance: number;
};

export type QuestionAnalysis = {
  question: string;
  yourAnswer: string;
  score: string;
  critique: string;
  betterAnswer: string;
};

export type InterviewEvaluation = {
  scores: InterviewScores;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  qaList: QuestionAnalysis[];
  evaluationMethod: "ai" | "practice_rubric";
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by",
  "can", "could", "did", "do", "does", "for", "from", "had", "has",
  "have", "how", "i", "if", "in", "into", "is", "it", "me", "my",
  "of", "on", "or", "our", "should", "so", "than", "that", "the",
  "their", "them", "there", "these", "they", "this", "to", "was",
  "we", "were", "what", "when", "where", "which", "who", "why",
  "will", "with", "would", "you", "your",
]);

const STRUCTURE_TERMS = [
  "first",
  "then",
  "finally",
  "because",
  "for example",
  "for instance",
  "as a result",
  "therefore",
];

const ACTION_TERMS = [
  "built",
  "created",
  "decided",
  "designed",
  "developed",
  "improved",
  "implemented",
  "led",
  "managed",
  "resolved",
  "result",
  "solution",
  "solved",
  "outcome",
];

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

function wordTokens(value: string): string[] {
  return value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function scoreAnswer(question: string, answer: string) {
  const tokens = wordTokens(answer);
  const questionKeywords = new Set(
    wordTokens(question).filter((token) => !STOP_WORDS.has(token)),
  );
  const answerKeywords = new Set(tokens);
  const matchingKeywords = [...questionKeywords].filter((token) =>
    answerKeywords.has(token),
  ).length;
  const answerText = answer.toLocaleLowerCase();
  const sentenceCount = answer
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0).length;
  const structureSignals = STRUCTURE_TERMS.filter((term) =>
    answerText.includes(term),
  ).length;
  const actionSignals = ACTION_TERMS.filter((term) =>
    answerText.includes(term),
  ).length;

  const scores = {
    knowledge: clampScore(1 + tokens.length / 10),
    structure: clampScore(
      1 + Math.min(sentenceCount, 4) + Math.min(structureSignals, 3),
    ),
    communication: clampScore(
      1 + Math.min(tokens.length / 12, 6) + (sentenceCount > 0 ? 2 : 0),
    ),
    problemSolving: clampScore(1 + Math.min(actionSignals, 6) * 1.5),
    relevance: clampScore(
      questionKeywords.size
        ? 2 + (7 * matchingKeywords) / questionKeywords.size
        : 5,
    ),
  };

  return {
    scores,
    wordCount: tokens.length,
    sentenceCount,
    matchingKeywords,
    actionSignals,
  };
}

function averageScore(values: number[]): number {
  if (values.length === 0) return 0;
  return Number(
    (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1),
  );
}

export function evaluateInterviewAnswers(
  answers: InterviewAnswer[],
): InterviewEvaluation {
  const analyses = answers.map((item) => ({
    item,
    ...scoreAnswer(item.question, item.answer),
  }));
  if (analyses.length === 0) {
    return {
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
      evaluationMethod: "practice_rubric",
    };
  }

  const scoreKeys = [
    "knowledge",
    "structure",
    "communication",
    "problemSolving",
    "relevance",
  ] as const;
  const dimensionScores = Object.fromEntries(
    scoreKeys.map((key) => [
      key,
      averageScore(analyses.map(({ scores }) => scores[key])),
    ]),
  ) as Omit<InterviewScores, "overall">;
  const overall = averageScore(Object.values(dimensionScores));

  const strongAreas: string[] = [];
  const weakAreas: string[] = [];
  const recommendations: string[] = [];

  if (dimensionScores.knowledge >= 6) {
    strongAreas.push("Answers included useful detail rather than only brief statements.");
  } else {
    weakAreas.push("Several answers were too brief to show your reasoning or experience.");
    recommendations.push("Expand each answer with context, your specific actions, and the outcome.");
  }

  if (dimensionScores.structure >= 6) {
    strongAreas.push("Answers showed some clear sequencing or explanation.");
  } else {
    weakAreas.push("Answers could be organized into clearer steps.");
    recommendations.push("Use a simple structure: situation, action, and result.");
  }

  if (dimensionScores.relevance >= 6) {
    strongAreas.push("Answers generally used concepts connected to the questions.");
  } else {
    weakAreas.push("Some answers did not clearly address the key terms in the question.");
    recommendations.push("Start by directly addressing the question before adding supporting detail.");
  }

  if (dimensionScores.problemSolving < 6) {
    weakAreas.push("Few specific actions, solutions, or outcomes were mentioned.");
    recommendations.push("Describe what you personally did and what changed as a result.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Keep practicing with specific examples and measurable outcomes.");
  }
  if (strongAreas.length === 0) {
    strongAreas.push("Your answers were recorded and are available for review.");
  }

  const qaList = analyses.map(({ item, scores, wordCount, sentenceCount, matchingKeywords, actionSignals }) => {
    const answerScore = averageScore(Object.values(scores));
    const observations: string[] = [];
    if (wordCount < 15) observations.push("Add more detail to make your reasoning clear.");
    if (sentenceCount < 2) observations.push("Use multiple sentences to organize your response.");
    if (matchingKeywords === 0) observations.push("Address the main subject of the question directly.");
    if (actionSignals === 0) observations.push("Include a specific action, solution, or outcome where relevant.");

    return {
      question: item.question,
      yourAnswer: item.answer,
      score: `${answerScore.toFixed(1)} / 10`,
      critique: observations.length
        ? observations.join(" ")
        : "Your answer had useful detail; adding a concrete example or outcome can make it stronger.",
      betterAnswer: "Practice rubric only: add relevant context, explain your actions, and share the outcome. This is not an AI-generated model answer.",
    };
  });

  return {
    scores: { overall, ...dimensionScores },
    strongAreas,
    weakAreas,
    recommendations,
    qaList,
    evaluationMethod: "practice_rubric",
  };
}
