"""
Thin wrapper around the Groq SDK so the rest of the app never has to think
about API keys, model names, or JSON-mode parsing directly.
"""

import json
import os
from functools import lru_cache

from groq import Groq

MODEL = "openai/gpt-oss-120b"


class GroqNotConfigured(Exception):
    """Raised when GROQ_API_KEY is missing so the app can fail with a clear message."""


@lru_cache
def get_client() -> Groq:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise GroqNotConfigured(
            "GROQ_API_KEY is not set. Add it to backend/.env (copy .env.example) "
            "or as an environment variable, then restart the server."
        )
    return Groq(api_key=api_key)


def chat_json(system_prompt: str, user_prompt: str, temperature: float = 0.4) -> dict:
    """
    Call the model and force it to return a single JSON object.
    Raises ValueError if the model's output can't be parsed as JSON, so
    callers can decide how to fall back.
    """
    client = get_client()
    completion = client.chat.completions.create(
        model=MODEL,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    raw = completion.choices[0].message.content
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError) as exc:
        raise ValueError(f"Model did not return valid JSON: {raw!r}") from exc
