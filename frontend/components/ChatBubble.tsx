import { Message } from "@/lib/types";

export default function ChatBubble({ message }: { message: Message }) {
  const isInterviewer = message.role === "interviewer";
  return (
    <div className={`flex w-full ${isInterviewer ? "justify-start" : "justify-end"}`}>
      <div
        className={[
          "max-w-[80%] rounded-card px-4 py-3 text-[15px] leading-relaxed animate-fadeSlideUp",
          isInterviewer
            ? "bg-surface2 border border-border text-ink"
            : "bg-accent/15 border border-accent/30 text-ink",
        ].join(" ")}
      >
        <div className="mb-1 font-mono text-[11px] text-muted">
          {isInterviewer ? "Interviewer" : "You"}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
