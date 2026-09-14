import { Band } from "@/lib/types";

const COLORS: Record<Band, string> = {
  excellent: "#4FB0A5",
  good: "#4FB0A5",
  adequate: "#E8A33D",
  weak: "#E2666B",
};

export default function ScoreRing({ score, band }: { score: number; band: Band }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = COLORS[band];

  return (
    <div className="relative inline-flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 150 150" className="h-40 w-40 -rotate-90">
        <circle cx="75" cy="75" r={radius} stroke="#2E3440" strokeWidth="10" fill="none" />
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-semibold" style={{ color }}>
          {score}
        </span>
        <span className="font-mono text-xs text-muted">/ 100</span>
      </div>
    </div>
  );
}
