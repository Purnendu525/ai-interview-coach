"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import ThinkingBubble from "@/components/ThinkingBubble";
import { submitAnswer, ApiError } from "@/lib/api";
import { useSessionStore } from "@/lib/store";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function InterviewPage() {
  const router = useRouter();
  const topic = useSessionStore((s) => s.topic);
  const difficulty = useSessionStore((s) => s.difficulty);
  const conversation = useSessionStore((s) => s.conversation);
  const appendAndSetOver = useSessionStore((s) => s.appendAndSetOver);

  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If someone lands here without an active session (e.g. a page refresh), send them back.
  useEffect(() => {
    if (!topic || conversation.length === 0) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, sending]);

  async function handleSend() {
    const trimmed = answer.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);
    setAnswer("");

    try {
      const res = await submitAnswer(topic, difficulty, conversation, trimmed);
      appendAndSetOver(res.conversation, res.is_over);
      if (res.is_over) {
        setTimeout(() => router.push("/report"), 900);
      }
    } catch (err) {
      setAnswer(trimmed);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!topic || conversation.length === 0) return null;

  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 px-4 py-3.5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <div className="font-display text-sm font-semibold text-ink">{topic}</div>
            <div className="font-mono text-xs text-muted">{DIFFICULTY_LABEL[difficulty]}</div>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted">
            live interview
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
        {conversation.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {sending && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 border-t border-border bg-bg px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={1}
              placeholder={sending ? "Waiting for the interviewer…" : "Type your answer…"}
              className="max-h-40 flex-1 resize-none rounded-card border border-border bg-surface2 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !answer.trim()}
              className="shrink-0 rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="font-mono text-[11px] text-muted">Enter to send · Shift+Enter for a new line</p>
        </div>
      </div>
    </main>
  );
}
