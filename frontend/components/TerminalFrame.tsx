export default function TerminalFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-card border border-border bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent2/70" />
        <span className="ml-2 font-mono text-xs text-muted">{label}</span>
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );
}
