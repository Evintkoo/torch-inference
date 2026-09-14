import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusPanel } from "./StatusPanel";
import type { HealthCheck, SystemInfo } from "./types";

const healthyResponse: HealthCheck = {
  status: "healthy",
  version: "1.0.0",
  timestamp: "2026-09-13T00:00:00Z",
  uptime_seconds: 120,
  checks: {},
};

const sampleInfo: SystemInfo = {
  system: {
    os: "macos",
    arch: "aarch64",
    cpu_count: 10,
    total_memory_bytes: 34359738368,
    total_memory_human: "32.0 GB",
    hostname: "dev-box",
  },
  gpu: { available: true, count: 1, devices: [] },
  runtime: { version: "1.0.0", build_date: "2026-09-13", rust_version: "1.81.0", uptime_secs: 120 },
  features: {
    cuda_enabled: false,
    onnx_enabled: true,
    torch_enabled: false,
    audio_processing: true,
    image_security: true,
  },
};

describe("StatusPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the health stat grid and system info card together", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((path: string) => {
        const body = path.includes("/health") ? healthyResponse : sampleInfo;
        return Promise.resolve({ ok: true, status: 200, json: async () => body });
      }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <StatusPanel />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getAllByText(/healthy/i).length).toBeGreaterThan(0));
    await waitFor(() => expect(screen.getByText(/macos/i)).toBeInTheDocument());
  });
});
