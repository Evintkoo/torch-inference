import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("main", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = "";
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
