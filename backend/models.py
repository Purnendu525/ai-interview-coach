"""
Shared data models for the AI Interview Coach backend.

Keeping these in one place means the request/response shape for every
endpoint is defined exactly once, and FastAPI uses them to validate
incoming requests and document the API automatically at /docs.
"""

from typing import List, Literal
from pydantic import BaseModel, Field

Difficulty = Literal["easy", "medium", "hard"]
Role = Literal["interviewer", "candidate"]


class Message(BaseModel):
    role: Role
    content: str


class StartRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    difficulty: Difficulty


class StartResponse(BaseModel):
    conversation: List[Message]
    is_over: bool = False


class AnswerRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    difficulty: Difficulty
    conversation: List[Message]
    answer: str = Field(..., min_length=1, max_length=4000)


class AnswerResponse(BaseModel):
    conversation: List[Message]
    is_over: bool


class ReportRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    difficulty: Difficulty
    conversation: List[Message]


class ReportResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    band: Literal["excellent", "good", "adequate", "weak"]
    passed: bool
    verdict: str
    strengths: List[str]
    weaknesses: List[str]
    topics_to_revise: List[str]
