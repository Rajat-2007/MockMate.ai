"""Interview AI service validation without making paid provider requests."""

from __future__ import annotations

import json

import httpx
import pytest
from app.core.config import Settings
from app.schemas.interview import (
    InterviewEvaluationRequest,
    QuestionGenerationRequest,
    QuestionGenerationResponse,
)
from app.services import interview
from fastapi import HTTPException


def question_request() -> QuestionGenerationRequest:
    return QuestionGenerationRequest(
        category="technical",
        role="Backend Developer",
        difficulty="Medium",
        language="English",
    )


async def test_generation_requires_a_configured_provider() -> None:
    with pytest.raises(HTTPException) as error:
        await interview.generate_questions(
            Settings(
                llm_api_key="",
                ollama_base_url="",
                ollama_model="",
            ),
            question_request(),
        )

    assert error.value.status_code == 503


async def test_generation_uses_ollama_when_no_provider_key_is_set(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    request_details: dict[str, object] = {}
    original_async_client = httpx.AsyncClient

    def handle_request(request: httpx.Request) -> httpx.Response:
        request_details["url"] = str(request.url)
        request_details["authorization"] = request.headers.get("authorization")
        request_details["body"] = request.read().decode()
        return httpx.Response(
            200,
            json={
                "message": {
                    "content": '{"questions":["Question one","Question two",'
                    '"Question three","Question four","Question five"]}'
                }
            },
        )

    transport = httpx.MockTransport(handle_request)
    monkeypatch.setattr(
        interview.httpx,
        "AsyncClient",
        lambda **kwargs: original_async_client(transport=transport, **kwargs),
    )

    result = await interview.generate_questions(
        Settings(
            llm_api_key="",
            ollama_base_url="http://localhost:11434",
            ollama_model="llama3.2:3b",
        ),
        question_request(),
    )
    request_body = json.loads(str(request_details["body"]))

    assert len(result.questions) == 5
    assert request_details["url"] == "http://localhost:11434/api/chat"
    assert request_details["authorization"] is None
    assert request_body["format"]["properties"]["questions"]["type"] == "array"


async def test_generation_rejects_the_wrong_number_of_questions(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def incomplete_response(*args, **kwargs) -> QuestionGenerationResponse:
        return QuestionGenerationResponse.model_construct(questions=["Question one"])

    monkeypatch.setattr(interview, "_complete_json", incomplete_response)

    with pytest.raises(HTTPException) as error:
        await interview.generate_questions(
            Settings(llm_api_key="test-key"), question_request()
        )

    assert error.value.status_code == 502


async def test_generation_retries_questions_already_used(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls = 0

    async def repeated_response(*args, **kwargs) -> QuestionGenerationResponse:
        nonlocal calls
        calls += 1
        return QuestionGenerationResponse.model_construct(
            questions=[
                "Could you explain database indexing and its trade-offs?",
                "How do you organize a technical project?",
                "What makes an API reliable?",
                "How do you investigate a slow application?",
                "How do you prevent concurrent request issues?",
            ]
        )

    monkeypatch.setattr(interview, "_complete_json", repeated_response)
    request = question_request().model_copy(
        update={
            "recent_questions": [
                "Could you explain database indexing and its trade-offs?"
            ]
        }
    )

    with pytest.raises(HTTPException) as error:
        await interview.generate_questions(Settings(llm_api_key="test-key"), request)

    assert error.value.status_code == 502
    assert calls == 2


async def test_evaluation_rejects_missing_question_feedback(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def incomplete_response(*args, **kwargs):
        return interview.InterviewEvaluationResponse.model_construct(
            scores={
                "overall": 5,
                "knowledge": 5,
                "structure": 5,
                "communication": 5,
                "problemSolving": 5,
                "relevance": 5,
            },
            strongAreas=["Answered the question."],
            weakAreas=[],
            recommendations=["Add a concrete example."],
            qaList=[],
        )

    monkeypatch.setattr(interview, "_complete_json", incomplete_response)
    request = InterviewEvaluationRequest(
        category="hr",
        role="Developer",
        answers=[
            {"question": "Tell me about yourself.", "answer": "I am a developer."}
        ],
    )

    with pytest.raises(HTTPException) as error:
        await interview.evaluate_answers(Settings(llm_api_key="test-key"), request)

    assert error.value.status_code == 502
