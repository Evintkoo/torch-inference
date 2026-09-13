import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./ChatComposer";

describe("ChatComposer", () => {
  it("sends the trimmed input and clears the field when Send is clicked", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} disabled={false} />);
    const input = screen.getByTestId("chat-input");
    await user.type(input, "hello world");
    await user.click(screen.getByTestId("chat-send-btn"));
    expect(onSend).toHaveBeenCalledWith("hello world");
    expect(input).toHaveValue("");
  });

  it("sends on Enter and inserts a newline on Shift+Enter instead", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} disabled={false} />);
    const input = screen.getByTestId("chat-input");

    await user.type(input, "line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue("line one\n");

    await user.type(input, "line two{Enter}");
    expect(onSend).toHaveBeenCalledWith("line one\nline two");
  });

  it("does not send blank/whitespace-only input", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} disabled={false} />);
    await user.type(screen.getByTestId("chat-input"), "   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables the input and send button while streaming", () => {
    render(<ChatComposer onSend={() => {}} disabled={true} />);
    expect(screen.getByTestId("chat-input")).toBeDisabled();
    expect(screen.getByTestId("chat-send-btn")).toBeDisabled();
  });
});
