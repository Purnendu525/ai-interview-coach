"""
AI Interview Coach — backend.

Three actions the frontend needs: start an interview, submit an answer,
and generate the report. There's no database — the frontend holds the
conversation and sends the whole thing back on every call.
"""

import os
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models import (
    StartRequest,
    StartResponse,
    AnswerRequest,
    AnswerResponse,
    ReportRequest,
    ReportResponse,
    Message,
)
from interviewer import get_next_message
from report_generator import generate_report
from groq_client import GroqNotConfigured

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-interview-coach")

app = FastAPI(title="AI Interview Coach API")

# Comma-separated list of extra allowed origins, e.g. your deployed Vercel URL.
# Localhost is always allowed so local development just works.
_extra_origins = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()
]
_allowed_origins = list(
    {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        *_extra_origins,
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    logger.info("=" * 60)
    logger.info("AI Interview Coach backend is up.")
    logger.info("Allowed frontend origins: %s", ", ".join(_allowed_origins))
    if not os.environ.get("GROQ_API_KEY"):
        logger.warning(
            "GROQ_API_KEY is not set — /api/start, /api/answer and /api/report "
            "will fail until it's added to backend/.env"
        )
    logger.info("=" * 60)


def _groq_error() -> HTTPException:
    return HTTPException(
        status_code=500,
        detail="The server is missing its Groq API key. Add GROQ_API_KEY to backend/.env and restart.",
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/start", response_model=StartResponse)
def start_interview(req: StartRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Please enter a topic to be interviewed on.")

    try:
        result = get_next_message(topic, req.difficulty, [])
    except GroqNotConfigured:
        raise _groq_error()
    except Exception:
        logger.exception("Failed to start interview")
        raise HTTPException(
            status_code=502, detail="Couldn't start the interview right now. Please try again."
        )

    conversation = [Message(role="interviewer", content=result["message"])]
    return StartResponse(conversation=conversation, is_over=False)


@app.post("/api/answer", response_model=AnswerResponse)
def submit_answer(req: AnswerRequest):
    answer = req.answer.strip()
    if not answer:
        raise HTTPException(status_code=400, detail="Please write an answer before sending.")
    if not req.conversation:
        raise HTTPException(status_code=400, detail="This interview hasn't started yet.")

    conversation = list(req.conversation)
    conversation.append(Message(role="candidate", content=answer))

    try:
        result = get_next_message(req.topic.strip(), req.difficulty, conversation)
    except GroqNotConfigured:
        raise _groq_error()
    except Exception:
        logger.exception("Failed to get next interviewer message")
        raise HTTPException(
            status_code=502,
            detail="The interviewer had trouble responding. Please try sending your answer again.",
        )

    conversation.append(Message(role="interviewer", content=result["message"]))
    return AnswerResponse(conversation=conversation, is_over=result["end_interview"])


@app.post("/api/report", response_model=ReportResponse)
def report(req: ReportRequest):
    if not req.conversation:
        raise HTTPException(status_code=400, detail="There's no interview to report on yet.")

    try:
        result = generate_report(req.topic.strip(), req.difficulty, req.conversation)
    except GroqNotConfigured:
        raise _groq_error()
    except Exception:
        logger.exception("Failed to generate report")
        raise HTTPException(
            status_code=502, detail="Couldn't generate the report right now. Please try again."
        )

    return ReportResponse(**result)
