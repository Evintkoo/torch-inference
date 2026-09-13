import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HealthBadge } from "./HealthBadge";
import type { HealthCheck } from "./types";

const healthyResponse: HealthCheck = {
  status: "healthy",
  version: "1.0.0",
  timestamp: "2026-09-13T00:00:00Z",
  uptime_seconds: 120,
  checks: {},
};

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("HealthBadge", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows a success-styled badge with the status text when healthy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => healthyResponse }),
    );
    renderWithClient(<HealthBadge />);
    await waitFor(() => expect(screen.getByText(/healthy/i)).toBeInTheDocument());
  });

  it("shows an unhealthy badge when the health endpoint 503s", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ ...healthyResponse, status: "unhealthy" }),
      }),
    );
    renderWithClient(<HealthBadge />);
    await waitFor(() => expect(screen.getByText(/unreachable/i)).toBeInTheDocument());
  });
});
