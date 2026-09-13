import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string) {}
  close() {}
}

describe("main", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.resetModules();
    // Dashboard renders MetricsChart (Task 7), which opens a real EventSource
    // against /dashboard/stream; stub it so mounting the app doesn't throw.
    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("mounts App into #root when it exists", async () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    await import("./main");

    // Wait for React to complete rendering
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(root.querySelector('[data-testid="panel-nav-dashboard"]')).toBeTruthy();
  });

  it("throws when #root is missing", async () => {
    await expect(import("./main")).rejects.toThrow("#root element not found in index.html");
  });
});
