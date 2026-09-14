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

  it("renders build date, rust version, and feature flags", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleInfo }),
    );
    renderWithClient(<SystemInfoCard />);
    await waitFor(() => expect(screen.getByText("2026-09-13")).toBeInTheDocument());
    expect(screen.getByText("1.81.0")).toBeInTheDocument();
    expect(screen.getByText("dev-box")).toBeInTheDocument();
    expect(screen.getAllByText("enabled").length).toBeGreaterThan(0);
    expect(screen.getAllByText("disabled").length).toBeGreaterThan(0);
  });

  it("shows 'No GPU detected' when no devices are reported", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => sampleInfo }),
    );
    renderWithClient(<SystemInfoCard />);
    await waitFor(() => expect(screen.getByText(/no gpu detected/i)).toBeInTheDocument());
  });

  it("renders a device row per reported GPU", async () => {
    const withGpu: SystemInfo = {
      ...sampleInfo,
      gpu: {
        available: true,
        count: 1,
        devices: [
          {
            id: 0,
            name: "RTX 4090",
            total_memory: 25769803776,
            total_memory_human: "24.0 GB",
            free_memory: 21474836480,
            free_memory_human: "20.0 GB",
            utilization: 42,
            temperature: 61,
          },
        ],
      },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => withGpu }),
    );
    renderWithClient(<SystemInfoCard />);
    const gpuCard = screen.getByTestId("system-info-gpu");
    await waitFor(() => expect(gpuCard).toHaveTextContent("RTX 4090"));
    expect(gpuCard).toHaveTextContent("42%");
    expect(gpuCard).toHaveTextContent("61°C");
  });
});
