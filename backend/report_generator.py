"""
The report generator.

Given the whole conversation, produces structured feedback: a score,
strengths and weaknesses grounded in what the candidate actually said,
topics to revise, a verdict, and a Pass/Fail. The score comes from the
model's judgment; the band and pass/fail are derived deterministically
from that score so the rubric is always applied consistently.
"""

import logging

from models import Difficulty, Message
from groq_client import chat_json, GroqNotConfigured

logger = logging.getLogger("ai-interview-coach")

SYSTEM_PROMPT = """You are grading a completed technical interview transcript.

Score the candidate from 0 to 100 based only on what they actually said in the transcript. \
Be fair and specific. Strengths and weaknesses must refer to concrete things the candidate said \
or failed to say — never generic filler.

Respond with ONLY a JSON object of this exact shape, nothing else:
{
  "score": <integer 0-100>,
  "verdict": "<2-3 sentence overall assessment, written to the candidate, second person>",
  "strengths": ["<specific strength grounded in the transcript>", "..."],
  "weaknesses": ["<specific weakness or gap grounded in the transcript>", "..."],
  "topics_to_revise": ["<short topic or subtopic name to study further>", "..."]
}

Give 2-4 items each for strengths, weaknesses, and topics_to_revise. If the candidate did \
not answer any questions at all, reflect that honestly rather than inventing strengths.
"""


def _transcript(conversation: list[Message]) -> str:
    lines = []
    for m in conversation:
        speaker = "Interviewer" if m.role == "interviewer" else "Candidate"
        lines.append(f"{speaker}: {m.content}")
    return "\n".join(lines)


def _band(score: int) -> str:
    if score >= 85:
        return "excellent"
    if score >= 70:
        return "good"
    if score >= 55:
        return "adequate"
    return "weak"


def _fallback_report() -> dict:
    return {
        "score": 0,
        "band": "weak",
        "passed": False,
        "verdict": "We couldn't generate a full report right now. Please try again.",
        "strengths": [],
        "weaknesses": [],
        "topics_to_revise": [],
    }


def generate_report(topic: str, difficulty: Difficulty, conversation: list[Message]) -> dict:
    user_prompt = (
        f"Topic: {topic}\nDifficulty: {difficulty}\n\nTranscript:\n{_transcript(conversation)}"
    )

    try:
        result = chat_json(SYSTEM_PROMPT, user_prompt, temperature=0.2)
        score = int(result.get("score", 0))
        score = max(0, min(100, score))
        band = _band(score)
        return {
            "score": score,
            "band": band,
            "passed": band != "weak",
            "verdict": str(result.get("verdict", "")).strip() or "No verdict was generated.",
            "strengths": [str(s) for s in result.get("strengths", [])][:6],
            "weaknesses": [str(s) for s in result.get("weaknesses", [])][:6],
            "topics_to_revise": [str(s) for s in result.get("topics_to_revise", [])][:6],
        }
    except GroqNotConfigured:
        raise
    except Exception:
        logger.exception("Groq call failed in generate_report; using fallback report")
        return _fallback_report()
