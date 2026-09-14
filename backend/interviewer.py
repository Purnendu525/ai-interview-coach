"""
The interviewer "brain".

Given a topic, a difficulty, and the conversation so far, this module asks
the model for the single next thing the interviewer should say, plus
whether the interview should end now. The model always replies with a
JSON object so the backend never has to guess where the question ends
and the control signal begins.
"""

from models import Difficulty, Message
from groq_client import chat_json, GroqNotConfigured

DIFFICULTY_BRIEF = {
    "easy": "basic definitions and recall. Ask about core concepts, terminology, "
    "and simple 'what is / how does X work' questions.",
    "medium": "applied problems. Give small concrete scenarios and ask the "
    "candidate to apply the concept, reason through an example, or spot an issue.",
    "hard": "trade-offs and system thinking. Push on why one approach beats "
    "another, edge cases, complexity, and design decisions at scale.",
}

MIN_QUESTIONS_BEFORE_END = 4
MAX_QUESTIONS_BEFORE_FORCE_END = 9


def _count_questions(conversation: list[Message]) -> int:
    return sum(1 for m in conversation if m.role == "interviewer")


def _transcript(conversation: list[Message]) -> str:
    if not conversation:
        return "(The interview has not started yet.)"
    lines = []
    for m in conversation:
        speaker = "Interviewer" if m.role == "interviewer" else "Candidate"
        lines.append(f"{speaker}: {m.content}")
    return "\n".join(lines)


def _system_prompt(topic: str, difficulty: Difficulty) -> str:
    return f"""You are conducting a live technical interview on the topic "{topic}" \
at {difficulty.upper()} difficulty.

At this difficulty, focus on {DIFFICULTY_BRIEF[difficulty]}

Rules you must always follow:
- Ask exactly ONE question or say exactly ONE thing at a time. Never bundle multiple questions.
- Never teach, never explain the concept, never hint at or reveal the correct answer, even indirectly.
- If the candidate's last answer was strong: acknowledge briefly (one short sentence) and move to a \
different aspect of the topic with a new question.
- If the candidate's last answer was partly right: ask exactly one probing follow-up question that \
targets the specific gap, without revealing the answer.
- If the candidate's last answer was wrong: note the gap in one short, neutral sentence (no correction \
of the concept itself) and move on to a new question.
- Stay professional, calm, and encouraging in tone. Never be sarcastic or harsh.
- Keep your message short: one to three sentences, like something an interviewer would actually say out loud.
- Decide for yourself when the interview should end. End it when you have covered enough ground to judge \
the candidate fairly, when the candidate is clearly struggling across several consecutive questions (end \
early and kindly, with a brief closing line), or once the key areas of the topic at this difficulty have \
been covered well. Do not end after just one or two questions unless the candidate explicitly asks to stop.

Respond with ONLY a JSON object of this exact shape, nothing else:
{{"message": "<the single thing the interviewer says next, or a brief closing line if ending>", \
"end_interview": <true or false>}}
"""


def _fallback_message(is_first: bool) -> dict:
    if is_first:
        return {
            "message": "Let's get started — tell me, in your own words, what this topic is about.",
            "end_interview": False,
        }
    return {
        "message": "Thanks for that. Let's move on to a different angle of this topic.",
        "end_interview": False,
    }


def get_next_message(topic: str, difficulty: Difficulty, conversation: list[Message]) -> dict:
    """
    Returns {"message": str, "end_interview": bool}.
    Called both to open the interview (conversation is empty) and after
    each candidate answer.
    """
    is_first = len(conversation) == 0
    question_count = _count_questions(conversation)

    system_prompt = _system_prompt(topic, difficulty)

    if is_first:
        user_prompt = (
            "This is the very start of the interview. Greet the candidate in one short "
            "sentence and ask your first question. end_interview must be false."
        )
    else:
        guidance = ""
        if question_count >= MAX_QUESTIONS_BEFORE_FORCE_END:
            guidance = (
                "\nYou have already asked several questions and covered good ground. "
                "Strongly consider ending the interview now with a brief, kind closing line."
            )
        elif question_count < MIN_QUESTIONS_BEFORE_END:
            guidance = (
                "\nThe interview has only just begun — do not end it yet, keep exploring the topic."
            )
        user_prompt = (
            f"Conversation so far:\n{_transcript(conversation)}\n\n"
            f"React to the candidate's most recent answer per your rules, then either ask the next "
            f"question or end the interview.{guidance}"
        )

    try:
        result = chat_json(system_prompt, user_prompt)
        message = str(result.get("message", "")).strip()
        end_interview = bool(result.get("end_interview", False))
        if not message:
            raise ValueError("empty message")
        if is_first:
            end_interview = False
        return {"message": message, "end_interview": end_interview}
    except GroqNotConfigured:
        raise
    except Exception:
        # Never crash the interview over a flaky model response — degrade gracefully.
        return _fallback_message(is_first)
