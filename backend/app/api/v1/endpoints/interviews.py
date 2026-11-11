"""Authenticated AI interview workflows."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import CurrentUserDep, SessionDep, SettingsDep
from app.schemas.interview import (
    InterviewEvaluationRequest,
    InterviewEvaluationResponse,
    QuestionGenerationRequest,
    QuestionGenerationResponse,
)
from app.services.billing import enforce_interview_quota, record_interview
from app.services.interview import evaluate_answers, generate_questions

router = APIRouter()


@router.post(
    "/questions",
    response_model=QuestionGenerationResponse,
    summary="Generate a tailored interview question set",
)
async def create_questions(
    data: QuestionGenerationRequest,
    current_user: CurrentUserDep,
    db: SessionDep,
    settings: SettingsDep,
) -> QuestionGenerationResponse:
    _, _, limit, _ = await enforce_interview_quota(db, settings, current_user)
    result = await generate_questions(settings, data)
    await record_interview(db, current_user.id, limit)
    return result


@router.post(
    "/evaluate",
    response_model=InterviewEvaluationResponse,
    summary="Evaluate interview answers and create a report",
)
async def evaluate_interview(
    data: InterviewEvaluationRequest,
    _: CurrentUserDep,
    settings: SettingsDep,
) -> InterviewEvaluationResponse:
    return await evaluate_answers(settings, data)
