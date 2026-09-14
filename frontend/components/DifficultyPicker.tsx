import { Difficulty } from "@/lib/types";

const OPTIONS: { value: Difficulty; label: string; hint: string }[] = [
  { value: "easy", label: "Easy", hint: "Definitions & recall" },
  { value: "medium", label: "Medium", hint: "Applied problems" },
  { value: "hard", label: "Hard", hint: "Trade-offs & systems" },
];

export default function DifficultyPicker({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={[
              "rounded-card border px-3 py-3 text-left transition-colors",
              active
                ? "border-accent bg-accent/10"
                : "border-border bg-surface2 hover:border-muted",
            ].join(" ")}
          >
            <div className="font-display text-sm font-semibold text-ink">{opt.label}</div>
            <div className="mt-0.5 text-xs text-muted">{opt.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
