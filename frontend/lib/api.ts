import {
  AnswerResponse,
  Difficulty,
  Message,
  ReportResponse,
  StartResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Check your connection and that the backend is running."
    );
  }

  if (!res.ok) {
    let detail = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      // ignore — use default message
    }
    throw new ApiError(detail);
  }

  return res.json() as Promise<T>;
}

export function startInterview(topic: string, difficulty: Difficulty) {
  return post<StartResponse>("/api/start", { topic, difficulty });
}

export function submitAnswer(
  topic: string,
  difficulty: Difficulty,
  conversation: Message[],
  answer: string
) {
  return post<AnswerResponse>("/api/answer", {
    topic,
    difficulty,
    conversation,
    answer,
  });
}

export function fetchReport(
  topic: string,
  difficulty: Difficulty,
  conversation: Message[]
) {
  return post<ReportResponse>("/api/report", { topic, difficulty, conversation });
}
