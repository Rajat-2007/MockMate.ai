import { describe, expect, it } from "vitest";

import { evaluateInterviewAnswers } from "@/lib/interview-evaluation";

describe("evaluateInterviewAnswers", () => {
  it("returns no fabricated feedback when there are no answers", () => {
    const evaluation = evaluateInterviewAnswers([]);

    expect(evaluation.scores.overall).toBe(0);
    expect(evaluation.qaList).toEqual([]);
    expect(evaluation.strongAreas).toEqual([]);
    expect(evaluation.weakAreas).toEqual([]);
  });

  it("scores brief answers lower and creates feedback for each answer", () => {
    const evaluation = evaluateInterviewAnswers([
      {
        question: "Describe how you resolved a challenging project issue.",
        answer: "Yes",
        timestamp: "10:00 AM",
      },
      {
        question: "Describe how you resolved a challenging project issue.",
        answer:
          "First, I investigated the issue and found the cause. Then I implemented a solution with the team. As a result, we resolved the problem before launch.",
        timestamp: "10:01 AM",
      },
    ]);

    expect(evaluation.qaList).toHaveLength(2);
    expect(Number.parseFloat(evaluation.qaList[1].score)).toBeGreaterThan(
      Number.parseFloat(evaluation.qaList[0].score),
    );
    expect(evaluation.scores.overall).toBeGreaterThan(0);
    expect(evaluation.evaluationMethod).toBe("practice_rubric");
  });
});
