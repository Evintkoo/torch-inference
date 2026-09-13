import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string) {}
  close() {}
}

describe("App", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the Dashboard nav tab by default", () => {
    // Dashboard renders MetricsChart (Task 7), which opens a real EventSource
    // against /dashboard/stream; stub it so mounting App doesn't throw.
    vi.stubGlobal("EventSource", MockEventSource);
    render(<App />);
    expect(screen.getByTestId("panel-nav-dashboard")).toBeInTheDocument();
  });
});
