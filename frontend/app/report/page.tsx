"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScoreRing from "@/components/ScoreRing";
import Spinner from "@/components/Spinner";
import { fetchReport, ApiError } from "@/lib/api";
import { useSessionStore } from "@/lib/store";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-card border border-border bg-surface2 p-5">
      <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
            <span className="text-ink/90">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const topic = useSessionStore((s) => s.topic);
  const difficulty = useSessionStore((s) => s.difficulty);
  const conversation = useSessionStore((s) => s.conversation);
  const report = useSessionStore((s) => s.report);
  const setReport = useSessionStore((s) => s.setReport);
  const reset = useSessionStore((s) => s.reset);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topic || conversation.length === 0) {
      router.replace("/");
      return;
    }
    if (!report) {
      loadReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchReport(topic, difficulty, conversation);
      setReport(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleStartNew() {
    reset();
    router.push("/");
  }

  if (!topic || conversation.length === 0) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center px-4 py-16 sm:px-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Interview Complete
      </h1>
      <p className="mt-2 font-mono text-xs text-muted">
        {topic} · {DIFFICULTY_LABEL[difficulty]}
      </p>

      {loading && (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted">
          <Spinner className="h-6 w-6" />
          <p className="text-sm">Scoring your interview…</p>
        </div>
      )}

      {!loading && error && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={loadReport}
            className="rounded-card border border-border bg-surface2 px-4 py-2 text-sm font-semibold text-ink hover:border-muted"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && report && (
        <div className="mt-10 flex w-full flex-col items-center gap-8">
          <ScoreRing score={report.score} band={report.band} />

          <span
            className={[
              "rounded-full border px-4 py-1.5 font-display text-sm font-semibold tracking-wide",
              report.passed
                ? "border-accent2/40 bg-accent2/10 text-accent2"
                : "border-danger/40 bg-danger/10 text-danger",
            ].join(" ")}
          >
            {report.passed ? "PASS" : "FAIL"}
          </span>

          <div className="w-full rounded-card border border-border bg-surface p-5">
            <h3 className="font-display text-sm font-semibold text-ink">Verdict</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/90">{report.verdict}</p>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            <Section title="Strengths" items={report.strengths} />
            <Section title="Areas for improvement" items={report.weaknesses} />
          </div>
          <div className="w-full">
            <Section title="Topics to revise" items={report.topics_to_revise} />
          </div>

          <button
            onClick={handleStartNew}
            className="mt-2 rounded-card bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Start New Interview
          </button>
        </div>
      )}
    </main>
  );
}
