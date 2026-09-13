import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  __resetScalarLoadPromiseForTests,
  isDarkTheme,
  loadScalarScript,
  scalarConfiguration,
} from "./scalar-config";

describe("isDarkTheme", () => {
  afterEach(() => document.documentElement.removeAttribute("data-theme"));

  it("is false when the app has no data-theme attribute", () => {
    document.documentElement.removeAttribute("data-theme");
    expect(isDarkTheme()).toBe(false);
  });

  it("is false when data-theme is light", () => {
    document.documentElement.setAttribute("data-theme", "light");
    expect(isDarkTheme()).toBe(false);
  });

  it("is true when data-theme is dark", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    expect(isDarkTheme()).toBe(true);
  });
});

describe("scalarConfiguration", () => {
  afterEach(() => document.documentElement.removeAttribute("data-theme"));

  it("points at this server's own OpenAPI spec and disables the hosted agent sidebar", () => {
    const config = scalarConfiguration();
    expect(config.url).toBe("/openapi.json");
    expect(config.agent).toEqual({ disabled: true, hideAddApi: true });
    expect(config.hideDarkModeToggle).toBe(true);
  });

  it("tracks the app's data-theme attribute", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    expect(scalarConfiguration()).toMatchObject({ darkMode: true, forceDarkModeState: "dark" });

    document.documentElement.setAttribute("data-theme", "light");
    expect(scalarConfiguration()).toMatchObject({ darkMode: false, forceDarkModeState: "light" });
  });
});

describe("loadScalarScript", () => {
  beforeEach(() => __resetScalarLoadPromiseForTests());

  afterEach(() => {
    delete window.Scalar;
    document.head.querySelectorAll('script[src="/assets/scalar.js"]').forEach((el) => el.remove());
  });

  it("resolves immediately when the bundle is already on window.Scalar", async () => {
    window.Scalar = { createApiReference: () => ({}) };
    await expect(loadScalarScript()).resolves.toBeUndefined();
    expect(document.head.querySelectorAll('script[src="/assets/scalar.js"]')).toHaveLength(0);
  });

  it("injects exactly one script tag even when called twice before it resolves", () => {
    const first = loadScalarScript();
    const second = loadScalarScript();
    expect(first).toBe(second);
    expect(document.head.querySelectorAll('script[src="/assets/scalar.js"]')).toHaveLength(1);
  });

  it("rejects and clears its cache when the script fails to load, so a retry can succeed", async () => {
    const failing = loadScalarScript();
    const script = document.head.querySelector<HTMLScriptElement>('script[src="/assets/scalar.js"]')!;
    script.onerror?.(new Event("error"));
    await expect(failing).rejects.toThrow("failed to load /assets/scalar.js");

    window.Scalar = { createApiReference: () => ({}) };
    await expect(loadScalarScript()).resolves.toBeUndefined();
  });
});
