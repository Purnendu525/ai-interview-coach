import { create } from "zustand";
import { Difficulty, Message, ReportResponse } from "./types";

interface SessionState {
  topic: string;
  difficulty: Difficulty;
  conversation: Message[];
  isOver: boolean;
  report: ReportResponse | null;
  begin: (topic: string, difficulty: Difficulty, conversation: Message[]) => void;
  appendAndSetOver: (conversation: Message[], isOver: boolean) => void;
  setReport: (report: ReportResponse) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  topic: "",
  difficulty: "easy",
  conversation: [],
  isOver: false,
  report: null,
  begin: (topic, difficulty, conversation) =>
    set({ topic, difficulty, conversation, isOver: false, report: null }),
  appendAndSetOver: (conversation, isOver) => set({ conversation, isOver }),
  setReport: (report) => set({ report }),
  reset: () =>
    set({ topic: "", difficulty: "easy", conversation: [], isOver: false, report: null }),
}));
