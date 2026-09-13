import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiReferencePanel } from "./ApiReferencePanel";
import { __resetScalarLoadPromiseForTests } from "./scalar-config";

function latestScalarScript(): HTMLScriptElement {
  const scripts = document.head.querySelectorAll<HTMLScriptElement>(
    'script[src="/assets/scalar.js"]',
  );
  const last = scripts[scripts.length - 1];
  if (!last) {
    throw new Error("no /assets/scalar.js script tag was injected");
  }
  return last;
}

describe("ApiReferencePanel", () => {
  beforeEach(() => {
    __resetScalarLoadPromiseForTests();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    delete window.Scalar;
    document.head.querySelectorAll('script[src="/assets/scalar.js"]').forEach((el) => el.remove());
    document.documentElement.removeAttribute("data-theme");
  });

  it("describes the panel and its data source", () => {
    render(<ApiReferencePanel />);
    expect(screen.getByRole("heading", { name: "API Reference" })).toBeInTheDocument();
    expect(screen.getByText(/openapi.json/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scalar" })).toHaveAttribute(
      "href",
      "https://github.com/scalar/scalar",
    );
  });

  it("injects the self-hosted Scalar bundle and mounts it into the ref'd div", async () => {
    const createApiReference = vi.fn().mockReturnValue({ updateConfiguration: vi.fn() });
    render(<ApiReferencePanel />);

    const script = latestScalarScript();
    window.Scalar = { createApiReference };
    script.onload?.(new Event("load"));

    await waitFor(() => expect(createApiReference).toHaveBeenCalledTimes(1));
    const [mountEl, config] = createApiReference.mock.calls[0]!;
    expect(mountEl).toBe(screen.getByTestId("api-reference-mount"));
    expect(config).toMatchObject({ url: "/openapi.json", darkMode: false });
  });

  it("does not re-inject the bundle script on a second mount once it is cached", async () => {
    const createApiReference = vi.fn().mockReturnValue({ updateConfiguration: vi.fn() });
    const { unmount } = render(<ApiReferencePanel />);
    const script = latestScalarScript();
    window.Scalar = { createApiReference };
    script.onload?.(new Event("load"));
    await waitFor(() => expect(createApiReference).toHaveBeenCalledTimes(1));

    unmount();
    render(<ApiReferencePanel />);
    await waitFor(() => expect(createApiReference).toHaveBeenCalledTimes(2));

    const scripts = document.head.querySelectorAll('script[src="/assets/scalar.js"]');
    expect(scripts).toHaveLength(1);
  });

  it("shows a fallback message when the bundle fails to load", async () => {
    render(<ApiReferencePanel />);
    const script = latestScalarScript();
    script.onerror?.(new Event("error"));

    await waitFor(() => expect(screen.getByTestId("api-reference-error")).toBeInTheDocument());
    expect(screen.getByTestId("api-reference-error")).toHaveTextContent(
      /failed to load \/assets\/scalar\.js/,
    );
  });

  it("re-applies configuration with darkMode: true when the app theme flips to dark", async () => {
    const updateConfiguration = vi.fn();
    const createApiReference = vi.fn().mockReturnValue({ updateConfiguration });
    render(<ApiReferencePanel />);
    const script = latestScalarScript();
    window.Scalar = { createApiReference };
    script.onload?.(new Event("load"));
    await waitFor(() => expect(createApiReference).toHaveBeenCalledTimes(1));

    document.documentElement.setAttribute("data-theme", "dark");

    await waitFor(() => expect(updateConfiguration).toHaveBeenCalled());
    const lastCall = updateConfiguration.mock.calls.at(-1)![0];
    expect(lastCall).toMatchObject({ darkMode: true, forceDarkModeState: "dark" });
  });
});
