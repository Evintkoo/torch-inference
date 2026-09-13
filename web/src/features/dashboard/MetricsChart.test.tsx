import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricsChart } from "./MetricsChart";
import type { DashboardEvent } from "./types";

class MockEventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;
  static instances: MockEventSource[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = MockEventSource.CONNECTING;
  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }
  close() {
    this.readyState = MockEventSource.CLOSED;
  }
}

const sampleEvent: DashboardEvent = {
  metrics: {
    uptime_s: 12,
    active_req: 1,
    total_req: 10,
    avg_latency_ms: 5,
    error_rate: 0,
    throughput_per_s: 2,
    cpu_pct: 42,
    mem_used_mb: 100,
    mem_total_mb: 1000,
  },
  gpu: [],
  downloads: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
  MockEventSource.instances = [];
});

describe("MetricsChart", () => {
  it("shows a waiting state before the first SSE sample arrives", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    render(<MetricsChart />);
    expect(screen.getByText(/waiting for metrics/i)).toBeInTheDocument();
  });

  it("shows an error state when the SSE connection closes before any data", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    render(<MetricsChart />);
    const source = MockEventSource.instances[0];

    source.readyState = MockEventSource.CLOSED;
    act(() => source.onerror?.());

    expect(screen.getByText(/unable to load live metrics/i)).toBeInTheDocument();
    expect(screen.queryByText(/waiting for metrics/i)).not.toBeInTheDocument();
  });

  it("renders a uPlot chart once a sample arrives and destroys it on unmount", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    const { container, unmount } = render(<MetricsChart />);
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    act(() => source.onmessage?.({ data: JSON.stringify(sampleEvent) }));

    expect(container.querySelector(".uplot")).toBeTruthy();

    expect(() => unmount()).not.toThrow();
    expect(container.querySelector(".uplot")).toBeFalsy();
  });
});
