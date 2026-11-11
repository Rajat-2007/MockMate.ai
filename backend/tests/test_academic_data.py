"""Tests for academic data catalog."""

from __future__ import annotations

from app.core.academic_data import (
    ACADEMIC_STREAMS,
    EXPERIENCE_LEVELS,
    INTERVIEW_LANGUAGES,
    TARGET_JOB_ROLES,
)


def test_academic_streams_structure() -> None:
    assert len(ACADEMIC_STREAMS) >= 8
    stream_ids = [s["id"] for s in ACADEMIC_STREAMS]
    assert "engineering" in stream_ids
    assert "computer_applications" in stream_ids
    assert "management" in stream_ids
    assert "commerce" in stream_ids
    assert "arts_humanities" in stream_ids
    assert "science" in stream_ids
    assert "law" in stream_ids
    assert "medical_healthcare" in stream_ids

    for stream in ACADEMIC_STREAMS:
        assert len(stream["courses"]) > 0
        assert len(stream["specializations"]) > 0


def test_interview_languages() -> None:
    assert len(INTERVIEW_LANGUAGES) >= 11
    codes = [lang["code"] for lang in INTERVIEW_LANGUAGES]
    assert "en" in codes
    assert "hi" in codes
    assert "hi-en" in codes


def test_experience_levels() -> None:
    assert len(EXPERIENCE_LEVELS) >= 5
    assert len(TARGET_JOB_ROLES) >= 10
