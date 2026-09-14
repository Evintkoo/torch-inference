import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusStatGrid } from "./StatusStatGrid";
import type { HealthCheck } from "./types";

const healthyResponse: HealthCheck = {
  status: "healthy",
  version: "1.0.0",
  timestamp: "2026-09-13T00:00:00Z",
  uptime_seconds: 125,
  checks: {},
  active_requests: 2,
  total_requests: 42,
  avg_latency_ms: 3.14,
  error_rate: 0.01,
};

const healthyWithChecks: HealthCheck = {
  ...healthyResponse,
  checks: {
    database: { status: "up", message: "connected", latency_ms: 3 },
    capacity: { status: "up", message: "0 active requests", latency_ms: 0 },
  },
};

function renderWithClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <StatusStatGrid />
    </QueryClientProvider>,
  );
}

describe("StatusStatGrid", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders all six stat tiles from the health response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => healthyResponse }),
    );
    renderWithClient();

    await waitFor(() => expect(screen.getByText("healthy")).toBeInTheDocument());
    expect(screen.getByText("2m 5s")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("3.14ms")).toBeInTheDocument();
    expect(screen.getByText("1.00%")).toBeInTheDocument();
  });

  it("renders each component health check as a row with status, message, and latency", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => healthyWithChecks }),
    );
    renderWithClient();

    const checks = await screen.findByTestId("health-checks");
    expect(checks).toHaveTextContent("database");
    expect(checks).toHaveTextContent("connected");
    expect(checks).toHaveTextContent("3ms");
    expect(checks).toHaveTextContent("capacity");
  });
});
