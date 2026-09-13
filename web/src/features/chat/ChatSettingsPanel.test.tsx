import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ChatSettingsPanel } from "./ChatSettingsPanel";
import { DEFAULT_CHAT_SETTINGS, type ChatSettings } from "./types";

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
    />
  );
}

describe("ChatSettingsPanel", () => {
  it("renders the current settings values", () => {
    render(<ChatSettingsPanel settings={DEFAULT_CHAT_SETTINGS} onChange={() => {}} />);
    expect(screen.getByTestId("chat-model-input")).toHaveValue(DEFAULT_CHAT_SETTINGS.model);
    expect(screen.getByTestId("chat-temperature-input")).toHaveValue(
      DEFAULT_CHAT_SETTINGS.temperature,
    );
    expect(screen.getByTestId("chat-max-tokens-input")).toHaveValue(
      DEFAULT_CHAT_SETTINGS.maxTokens,
    );
  });

  it("calls onChange with an updated model as the user types", async () => {
    const user = userEvent.setup();
    let latest: ChatSettings | undefined;
    render(<StatefulPanel onSettled={(s) => (latest = s)} />);
    await user.type(screen.getByTestId("chat-model-input"), "x");
    expect(latest?.model).toBe(`${DEFAULT_CHAT_SETTINGS.model}x`);
  });

  it("calls onChange with a numeric temperature as the user types", async () => {
    const user = userEvent.setup();
    let latest: ChatSettings | undefined;
    render(<StatefulPanel onSettled={(s) => (latest = s)} />);
    const input = screen.getByTestId("chat-temperature-input");
    await user.clear(input);
    await user.type(input, "1.5");
    expect(latest?.temperature).toBe(1.5);
  });

  it("updates the system prompt field as free text", async () => {
    const user = userEvent.setup();
    let latest: ChatSettings | undefined;
    render(<StatefulPanel onSettled={(s) => (latest = s)} />);
    await user.type(screen.getByTestId("chat-system-prompt-input"), "Be terse.");
    expect(latest?.systemPrompt).toBe("Be terse.");
  });
});
