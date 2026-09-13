import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricsChart } from "./MetricsChart";

class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string) {}
  close() {}
}

afterEach(() => vi.unstubAllGlobals());

describe("MetricsChart", () => {
  it("shows a waiting state before the first SSE sample arrives", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    render(<MetricsChart />);
    expect(screen.getByText(/waiting for metrics/i)).toBeInTheDocument();
  });
});
