import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DetectPanel } from "./DetectPanel";

// DetectLiveStream probes model status via apiPostForm and DetectFileUpload doesn't touch the
// network until a Detect click — stub fetch so mount doesn't hit a real network.
function stubFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
  );
}

describe("DetectPanel", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows the File tab by default", () => {
    stubFetch();
    render(<DetectPanel />);
    expect(screen.getByTestId("det-pane-file")).toBeVisible();
  });

  it("switches to the Live Stream tab on click", async () => {
    stubFetch();
    const user = userEvent.setup();
    render(<DetectPanel />);
    await user.click(screen.getByTestId("det-tab-live"));
    expect(screen.getByTestId("det-pane-live")).toBeVisible();
  });

  it("renders the file-upload Detect button on the default tab", () => {
    stubFetch();
    render(<DetectPanel />);
    expect(screen.getByTestId("detect-btn")).toBeInTheDocument();
  });

  it("renders the live-stream Connect button once the Live Stream tab is active", async () => {
    stubFetch();
    const user = userEvent.setup();
    render(<DetectPanel />);
    await user.click(screen.getByTestId("det-tab-live"));
    expect(screen.getByTestId("det-ws-btn")).toBeInTheDocument();
  });
});
