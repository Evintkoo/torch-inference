import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DetectPanel } from "./DetectPanel";

// DetectFileUpload (rendered by DetectPanel) sources Model Version/Size
// availability badges via react-query, so it needs a QueryClientProvider.
function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("DetectPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders a single Detect view — no File/Live Stream tab toggle", () => {
    renderWithClient(<DetectPanel />);
    expect(screen.getByTestId("detect-dropzone")).toBeVisible();
    expect(screen.getByTestId("detect-btn")).toBeInTheDocument();
    expect(screen.queryByTestId("det-mode-toggle")).not.toBeInTheDocument();
  });

  it("renders both camera entry points instead of a single Camera button", () => {
    renderWithClient(<DetectPanel />);
    expect(screen.getByTestId("detect-camera-photo-btn")).toBeInTheDocument();
    expect(screen.getByTestId("detect-camera-live-btn")).toBeInTheDocument();
  });
});
