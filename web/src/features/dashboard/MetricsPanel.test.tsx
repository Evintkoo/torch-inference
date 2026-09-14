import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricsPanel } from "./MetricsPanel";
import { MetricsStreamProvider } from "./MetricsStreamContext";
import type { DashboardEvent } from "./types";

function renderPanel() {
  return render(
    <MetricsStreamProvider>
      <MetricsPanel />
    </MetricsStreamProvider>,
  );
}

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
    uptime_s: 125,
    active_req: 1,
    total_req: 10,
    avg_latency_ms: 5,
    error_rate: 0,
    throughput_per_s: 2,
    cpu_pct: 42,
    mem_used_mb: 250,
    mem_total_mb: 1000,
    process_mem_mb: 96.5,
    process_cpu_pct: 3.2,
  },
  gpu: [],
  downloads: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
  MockEventSource.instances = [];
});

describe("MetricsPanel", () => {
  it("renders a heading and a waiting state before any sample arrives", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    renderPanel();
    expect(screen.getByRole("heading", { name: "Metrics" })).toBeInTheDocument();
    expect(screen.getByTestId("metrics-waiting")).toBeInTheDocument();
  });

  it("shows an error state when the SSE connection closes before any data", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    renderPanel();
    const source = MockEventSource.instances[0];

    source.readyState = MockEventSource.CLOSED;
    act(() => source.onerror?.());

    expect(screen.getByTestId("metrics-error")).toBeInTheDocument();
    expect(screen.queryByTestId("metrics-waiting")).not.toBeInTheDocument();
  });

  it("renders the stat tiles with values derived from the live sample", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    renderPanel();
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    act(() => source.onmessage?.({ data: JSON.stringify(sampleEvent) }));

    const grid = screen.getByTestId("metrics-stat-grid");
    expect(grid).toHaveTextContent("CPU Usage");
    expect(grid).toHaveTextContent("42.0%");
    expect(grid).toHaveTextContent("Mem Usage");
    expect(grid).toHaveTextContent("25.0%"); // 250 / 1000
    expect(grid).toHaveTextContent("Mem Used");
    expect(grid).toHaveTextContent("250 MB");
    expect(grid).toHaveTextContent("Mem Free");
    expect(grid).toHaveTextContent("750 MB"); // 1000 - 250
    expect(grid).toHaveTextContent("Process Mem");
    expect(grid).toHaveTextContent("97 MB"); // 96.5 rounded
    expect(grid).toHaveTextContent("Process CPU");
    expect(grid).toHaveTextContent("3.2%");
    expect(grid).toHaveTextContent("Uptime");
    expect(grid).toHaveTextContent("2m 5s");
  });

  it("renders three live sparklines once a sample arrives and destroys their charts on unmount", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    const { container, unmount } = renderPanel();
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    act(() => source.onmessage?.({ data: JSON.stringify(sampleEvent) }));

    expect(screen.getByTestId("metrics-sparkline-cpu")).toBeInTheDocument();
    expect(screen.getByTestId("metrics-sparkline-memory")).toBeInTheDocument();
    expect(screen.getByTestId("metrics-sparkline-process-memory")).toBeInTheDocument();
    expect(container.querySelectorAll(".uplot")).toHaveLength(3);

    expect(() => unmount()).not.toThrow();
    expect(container.querySelectorAll(".uplot")).toHaveLength(0);
  });
});
