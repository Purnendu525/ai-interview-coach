"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TerminalFrame from "@/components/TerminalFrame";
import DifficultyPicker from "@/components/DifficultyPicker";
import Spinner from "@/components/Spinner";
import { startInterview, ApiError } from "@/lib/api";
import { useSessionStore } from "@/lib/store";
import { Difficulty } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const begin = useSessionStore((s) => s.begin);

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError("Enter a topic to be interviewed on — e.g. Binary Trees.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await startInterview(trimmed, difficulty);
      begin(trimmed, difficulty, res.conversation);
      router.push("/interview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          AI Interview Coach
        </h1>
        <p className="mt-3 max-w-md text-balance text-sm text-muted">
          Pick a technical topic and a difficulty. An AI interviewer will question you one step
          at a time, then score how you did.
        </p>
      </div>

      <div className="w-full max-w-md">
        <TerminalFrame label="new-interview">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="topic" className="mb-2 block text-sm font-medium text-ink">
                Topic
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Binary Trees, REST APIs, SQL Joins…"
                disabled={loading}
                className="w-full rounded-card border border-border bg-surface2 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">Difficulty</label>
              <DifficultyPicker value={difficulty} onChange={setDifficulty} />
            </div>

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Spinner className="h-4 w-4" />}
              {loading ? "Starting interview…" : "Start Interview"}
            </button>
          </form>
        </TerminalFrame>
      </div>
    </main>
  );
}
