import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SystemInfoCard } from "./SystemInfoCard";
import type { SystemInfo } from "./types";

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

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("SystemInfoCard", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders OS, CPU count, and memory once the fetch resolves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleInfo }),
    );
    renderWithClient(<SystemInfoCard />);
    await waitFor(() => expect(screen.getByText(/macos/i)).toBeInTheDocument());
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/32\.0 GB/)).toBeInTheDocument();
  });
});
