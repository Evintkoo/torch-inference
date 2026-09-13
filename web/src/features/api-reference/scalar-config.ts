// Loader + configuration for Scalar's standalone API-reference bundle
// (github.com/scalar/scalar) — same self-hosted-with-CSS-var-theming setup
// the old playground.html used (see its "API Reference page (Scalar)"
// section). The bundle itself is served by this app at `/assets/scalar.js`
// (src/api/assets.rs::serve_scalar_js) and reads the spec from
// `/openapi.json` (src/api/openapi.rs::serve_openapi) — both unchanged by
// this migration.

export interface ScalarConfiguration {
  url: string;
  theme: string;
  hideDarkModeToggle: boolean;
  darkMode: boolean;
  forceDarkModeState: "dark" | "light";
  withDefaultFonts: boolean;
  hideClientButton: boolean;
  agent: { disabled: boolean; hideAddApi: boolean };
  defaultHttpClient: { targetKey: string; clientKey: string };
  customCss: string;
}

export interface ScalarApiReferenceInstance {
  updateConfiguration?: (config: ScalarConfiguration) => void;
  destroy?: () => void;
}

export interface ScalarGlobal {
  createApiReference: (mount: HTMLElement, config: ScalarConfiguration) => ScalarApiReferenceInstance;
}

declare global {
  interface Window {
    Scalar?: ScalarGlobal;
  }
}

/// Mirrors playground.html's `scalarIsDark()` — the embed follows this app's
/// `data-theme` attribute on `<html>` rather than keeping its own state.
export function isDarkTheme(): boolean {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

// Maps Scalar's themable CSS custom properties onto this app's own shadcn/
// Tailwind design tokens (`web/src/styles/globals.css`), the same way
// playground.html mapped them onto its own `--bg`/`--surface`/`--text`/etc.
// tokens. There's no dedicated warning/orange/purple token in this palette
// (unlike the old `--yellow`), so those fall back to the accent-ish tokens
// that are closest in intent.
export function scalarCustomCss(): string {
  return `
    #scalar-api-reference {
      --scalar-color-1: var(--color-foreground);
      --scalar-color-2: var(--color-muted-foreground);
      --scalar-color-3: var(--color-muted-foreground);
      --scalar-color-accent: var(--color-primary);
      --scalar-color-ghost: var(--color-muted-foreground);
      --scalar-color-disabled: var(--color-muted-foreground);
      --scalar-background-1: var(--color-card);
      --scalar-background-2: var(--color-muted);
      --scalar-background-3: var(--color-background);
      --scalar-background-4: var(--color-border);
      --scalar-background-accent: var(--color-accent);
      --scalar-border-color: var(--color-border);
      --scalar-radius: var(--radius-sm);
      --scalar-radius-lg: var(--radius-md);
      --scalar-radius-xl: var(--radius-lg);
      --scalar-radius-2xl: var(--radius-xl);
      --scalar-radius-3xl: var(--radius-xl);
      --scalar-button-1: var(--color-primary);
      --scalar-button-1-color: var(--color-primary-foreground);
      --scalar-button-1-hover: var(--color-accent);
      --scalar-color-green: var(--color-success);
      --scalar-color-red: var(--color-destructive);
      --scalar-color-yellow: var(--color-accent-foreground);
      --scalar-color-blue: var(--color-primary);
      --scalar-color-orange: var(--color-accent-foreground);
      --scalar-color-purple: var(--color-primary);
      --scalar-scrollbar-color: var(--color-border);
      --scalar-scrollbar-color-active: var(--color-muted-foreground);
      --scalar-sidebar-background-1: var(--color-card);
      --scalar-sidebar-color-1: var(--color-foreground);
      --scalar-sidebar-color-2: var(--color-muted-foreground);
      --scalar-sidebar-color-active: var(--color-primary);
      --scalar-sidebar-border-color: var(--color-border);
      --scalar-sidebar-item-hover-color: var(--color-primary);
      --scalar-sidebar-item-hover-background: var(--color-muted);
      --scalar-sidebar-item-active-background: var(--color-accent);
      --scalar-sidebar-search-background: var(--color-input);
      --scalar-sidebar-search-border-color: var(--color-border);
      --scalar-sidebar-search-color: var(--color-muted-foreground);
      --scalar-header-background-1: var(--color-card);
      --scalar-header-border-color: var(--color-border);
      height: 100%;
    }
  `;
}

export function scalarConfiguration(): ScalarConfiguration {
  const dark = isDarkTheme();
  return {
    url: "/openapi.json",
    theme: "none",
    hideDarkModeToggle: true,
    darkMode: dark,
    forceDarkModeState: dark ? "dark" : "light",
    withDefaultFonts: false,
    hideClientButton: false,
    // Fully disables Scalar's "agent chat" / add-more-APIs sidebar feature,
    // which otherwise calls out to api.scalar.com on mount. That call would
    // be blocked by this app's CSP anyway; disabling it up front avoids a
    // console error and keeps the reference fully self-hosted/offline-friendly.
    agent: { disabled: true, hideAddApi: true },
    defaultHttpClient: { targetKey: "shell", clientKey: "curl" },
    customCss: scalarCustomCss(),
  };
}

let scalarLoadPromise: Promise<void> | null = null;

/// Mirrors playground.html's `loadScalarScript()`: fetch-once, cache the
/// in-flight promise so repeat mounts (e.g. switching tabs away and back)
/// don't re-download the ~1MB bundle, and reset the cache on failure so a
/// later retry (e.g. after the network recovers) can succeed.
export function loadScalarScript(): Promise<void> {
  if (window.Scalar?.createApiReference) {
    return Promise.resolve();
  }
  if (scalarLoadPromise) {
    return scalarLoadPromise;
  }
  scalarLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/assets/scalar.js";
    script.onload = () => resolve();
    script.onerror = () => {
      scalarLoadPromise = null;
      reject(new Error("failed to load /assets/scalar.js"));
    };
    document.head.appendChild(script);
  });
  return scalarLoadPromise;
}

/// Test-only escape hatch: resets the module-level load-promise cache so
/// each test gets a fresh `loadScalarScript()` call instead of inheriting
/// state left over by a previous test.
export function __resetScalarLoadPromiseForTests(): void {
  scalarLoadPromise = null;
}
