import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

export function ChatMessageList({
  messages,
  streaming,
}: {
  messages: ChatMessage[];
  streaming: boolean;
}) {
  if (messages.length === 0) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-1 py-12 text-center"
        data-testid="chat-welcome"
      >
        <p className="text-base font-medium">What can I help with?</p>
        <p className="text-sm text-muted-foreground">
          Ask anything — replies stream in as they&rsquo;re generated.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto py-2"
      role="log"
      aria-live="polite"
      aria-label="Chat conversation"
      data-testid="chat-message-list"
    >
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1;
        const isPendingAssistant = message.role === "assistant" && !message.content && streaming && isLast;
        return (
          <div
            key={message.id}
            data-testid={`chat-message-${message.role}`}
            className={cn("flex flex-col", message.role === "user" ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "border border-foreground bg-transparent text-foreground"
                  : "border border-border bg-card text-card-foreground",
              )}
            >
              {isPendingAssistant ? (
                <span className="text-muted-foreground" aria-label="Assistant is typing">
                  …
                </span>
              ) : (
                message.content
              )}
              {message.toolResults?.map((result, i) => (
                <div
                  key={i}
                  data-testid={`chat-tool-result-${result.name}`}
                  className={cn(
                    "mt-2 border px-2.5 py-2 text-xs",
                    result.status === "error"
                      ? "border-destructive/40 text-destructive"
                      : "border-border bg-background/50",
                  )}
                >
                  <div className="font-medium">
                    <i
                      className={result.name === "tts" ? "ri-volume-up-line" : "ri-search-line"}
                      aria-hidden="true"
                    />{" "}
                    {result.summary}
                  </div>
                  {result.audioUrl && (
                    <audio controls autoPlay src={result.audioUrl} className="mt-1.5 w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
