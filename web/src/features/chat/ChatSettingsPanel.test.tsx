import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatSettingsPanel } from "./ChatSettingsPanel";
import { DEFAULT_CHAT_SETTINGS, type ChatSettings } from "./types";

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

// A stateful harness — ChatSettingsPanel is a controlled component, so
// exercising real typing needs a parent that actually applies onChange,
// otherwise the input value snaps back after every keystroke.
function StatefulPanel({ onSettled }: { onSettled?: (settings: ChatSettings) => void }) {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  return (
    <ChatSettingsPanel
      settings={settings}
      onChange={(next) => {
        setSettings(next);
        onSettled?.(next);
      }}
      onClose={() => {}}
    />
  );
}

describe("ChatSettingsPanel", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ id: "hrm-text-1b" }, { id: "other-model" }] }),
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("renders the current settings values", () => {
    renderWithClient(
      <ChatSettingsPanel settings={DEFAULT_CHAT_SETTINGS} onChange={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByTestId("chat-model-input")).toHaveTextContent(DEFAULT_CHAT_SETTINGS.model);
    expect(screen.getByTestId("chat-temperature-input")).toHaveValue(
      DEFAULT_CHAT_SETTINGS.temperature,
    );
    expect(screen.getByTestId("chat-max-tokens-input")).toHaveValue(
      DEFAULT_CHAT_SETTINGS.maxTokens,
    );
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithClient(
      <ChatSettingsPanel settings={DEFAULT_CHAT_SETTINGS} onChange={() => {}} onClose={onClose} />,
    );
    await user.click(screen.getByTestId("chat-settings-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onChange with the picked model from the live /llm/v1/models list", async () => {
    const user = userEvent.setup();
    let latest: ChatSettings | undefined;
    renderWithClient(<StatefulPanel onSettled={(s) => (latest = s)} />);

    await user.click(screen.getByTestId("chat-model-input"));
    const option = await screen.findByRole("option", { name: "other-model" });
    await user.click(option);
    expect(latest?.model).toBe("other-model");
  });

  it("calls onChange with a numeric temperature as the user types", async () => {
    const user = userEvent.setup();
    let latest: ChatSettings | undefined;
    renderWithClient(<StatefulPanel onSettled={(s) => (latest = s)} />);
    const input = screen.getByTestId("chat-temperature-input");
    await user.clear(input);
    await user.type(input, "1.5");
    expect(latest?.temperature).toBe(1.5);
  });

  it("updates the system prompt field as free text", async () => {
    const user = userEvent.setup();
    let latest: ChatSettings | undefined;
    renderWithClient(<StatefulPanel onSettled={(s) => (latest = s)} />);
    const input = screen.getByTestId("chat-system-prompt-input");
    await user.clear(input);
    await user.type(input, "Be terse.");
    expect(latest?.systemPrompt).toBe("Be terse.");
  });
});
