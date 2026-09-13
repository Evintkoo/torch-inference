import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMessageList } from "./ChatMessageList";
import type { ChatMessage } from "./types";

describe("ChatMessageList", () => {
  it("shows the welcome state when there are no messages", () => {
    render(<ChatMessageList messages={[]} streaming={false} />);
    expect(screen.getByTestId("chat-welcome")).toBeInTheDocument();
    expect(screen.getByText(/what can i help with/i)).toBeInTheDocument();
  });

  it("renders user and assistant bubbles in order", () => {
    const messages: ChatMessage[] = [
      { id: "1", role: "user", content: "hello" },
      { id: "2", role: "assistant", content: "hi there" },
    ];
    render(<ChatMessageList messages={messages} streaming={false} />);
    expect(screen.getByTestId("chat-message-user")).toHaveTextContent("hello");
    expect(screen.getByTestId("chat-message-assistant")).toHaveTextContent("hi there");
  });

  it("shows a typing indicator for an empty, still-streaming assistant bubble", () => {
    const messages: ChatMessage[] = [
      { id: "1", role: "user", content: "hello" },
      { id: "2", role: "assistant", content: "" },
    ];
    render(<ChatMessageList messages={messages} streaming={true} />);
    expect(screen.getByLabelText(/assistant is typing/i)).toBeInTheDocument();
  });
});
