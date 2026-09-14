export type Difficulty = "easy" | "medium" | "hard";

export type Role = "interviewer" | "candidate";

export interface Message {
  role: Role;
  content: string;
}

export interface StartResponse {
  conversation: Message[];
  is_over: boolean;
}

export interface AnswerResponse {
  conversation: Message[];
  is_over: boolean;
}

export type Band = "excellent" | "good" | "adequate" | "weak";

export interface ReportResponse {
  score: number;
  band: Band;
  passed: boolean;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  topics_to_revise: string[];
}

export interface ApiErrorShape {
  detail?: string;
}
