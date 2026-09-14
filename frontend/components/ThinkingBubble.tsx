export default function ThinkingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-center gap-1.5 rounded-card border border-border bg-surface2 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-muted [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-muted [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-muted" />
      </div>
    </div>
  );
}
