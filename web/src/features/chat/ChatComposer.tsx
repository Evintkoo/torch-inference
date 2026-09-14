import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";

export function ChatComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (disabled || !value.trim()) {
      return;
    }
    onSend(value);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter inserts a newline — same binding as
    // playground.html's llmInputKey().
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-border pt-3">
      <textarea
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Assistant…"
        aria-label="Chat message"
        disabled={disabled}
        className="max-h-32 min-h-[40px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
        data-testid="chat-input"
      />
      <Button
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        title="Send (Enter)"
        data-testid="chat-send-btn"
      >
        Send
      </Button>
    </div>
  );
}
