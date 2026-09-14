import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatPanel } from "./ChatPanel";

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]));
        i += 1;
      } else {
        controller.close();
      }
    },
  });
}

describe("ChatPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows the welcome state before any message is sent", () => {
    renderWithClient(<ChatPanel />);
    expect(screen.getByTestId("chat-welcome")).toBeInTheDocument();
  });

  it("sends a message and streams the assistant reply into the thread", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: sseStream([
          'data: {"choices":[{"delta":{"content":"42"}}]}\n\n',
          "data: [DONE]\n\n",
        ]),
      }),
    );

    renderWithClient(<ChatPanel />);
    await user.type(screen.getByTestId("chat-input"), "what is the answer?{Enter}");

    expect(screen.getByTestId("chat-message-user")).toHaveTextContent("what is the answer?");
    await waitFor(() => expect(screen.getByTestId("chat-message-assistant")).toHaveTextContent("42"));
  });

  it("toggles the settings panel via the Settings button", async () => {
    const user = userEvent.setup();
    renderWithClient(<ChatPanel />);
    expect(screen.queryByTestId("chat-settings-panel")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("chat-settings-toggle"));
    expect(screen.getByTestId("chat-settings-panel")).toBeInTheDocument();
    await user.click(screen.getByTestId("chat-settings-toggle"));
    expect(screen.queryByTestId("chat-settings-panel")).not.toBeInTheDocument();
  });

  it("New chat clears the thread and returns to the welcome state", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, body: sseStream(["data: [DONE]\n\n"]) }),
    );
    renderWithClient(<ChatPanel />);
    await user.type(screen.getByTestId("chat-input"), "hi{Enter}");
    await waitFor(() => expect(screen.getByTestId("chat-new-btn")).toBeEnabled());

    await user.click(screen.getByTestId("chat-new-btn"));
    expect(screen.getByTestId("chat-welcome")).toBeInTheDocument();
  });

  it("surfaces a backend error without crashing the panel", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: "boom" }) }),
    );
    renderWithClient(<ChatPanel />);
    await user.type(screen.getByTestId("chat-input"), "hi{Enter}");
    await waitFor(() => expect(screen.getByTestId("chat-error")).toBeInTheDocument());
  });
});
