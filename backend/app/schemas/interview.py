"""Interview question generation and evaluation payloads."""

from __future__ import annotations

import uuid
from typing import Literal

from pydantic import BaseModel, Field


class QuestionGenerationRequest(BaseModel):
    category: str = Field(min_length=2, max_length=80)
    role: str = Field(min_length=2, max_length=160)
    course: str | None = Field(default=None, max_length=120)
    difficulty: Literal["Fresher", "Medium", "Hard"] = "Medium"
    personality: str = Field(default="professional", max_length=60)
    language: str = Field(default="English", max_length=60)
    question_count: int = Field(default=5, ge=3, le=12)
    resume_text: str | None = Field(default=None, max_length=6000)
    session_nonce: uuid.UUID = Field(default_factory=uuid.uuid4)
    recent_questions: list[str] = Field(default_factory=list, max_length=60)


class QuestionGenerationResponse(BaseModel):
    questions: list[str] = Field(min_length=3, max_length=12)


class SubmittedAnswer(BaseModel):
    question: str = Field(min_length=1, max_length=600)
    answer: str = Field(min_length=1, max_length=6000)


class InterviewEvaluationRequest(BaseModel):
    category: str = Field(min_length=2, max_length=80)
    role: str = Field(min_length=2, max_length=160)
    language: str = Field(default="English", max_length=60)
    answers: list[SubmittedAnswer] = Field(min_length=1, max_length=20)


class EvaluationScores(BaseModel):
    overall: float = Field(ge=0, le=10)
    knowledge: float = Field(ge=0, le=10)
    structure: float = Field(ge=0, le=10)
    communication: float = Field(ge=0, le=10)
    problemSolving: float = Field(ge=0, le=10)  # noqa: N815 - API field name
    relevance: float = Field(ge=0, le=10)


class QuestionFeedback(BaseModel):
    question: str
    yourAnswer: str  # noqa: N815 - API field name
    score: str
    critique: str
    betterAnswer: str  # noqa: N815 - API field name


class InterviewEvaluationResponse(BaseModel):
    scores: EvaluationScores
    strongAreas: list[str] = Field(max_length=8)  # noqa: N815 - API field name
    weakAreas: list[str] = Field(max_length=8)  # noqa: N815 - API field name
    recommendations: list[str] = Field(min_length=1, max_length=8)
    qaList: list[QuestionFeedback] = Field(min_length=1, max_length=20)  # noqa: N815 - API field name
    evaluationMethod: Literal["ai"] = "ai"  # noqa: N815 - API field name
