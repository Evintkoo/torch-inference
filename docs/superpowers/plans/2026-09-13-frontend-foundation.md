# Frontend Foundation (Scaffold + Shell + Dashboard Panel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the new React/Vite/shadcn frontend in `web/`, wire it into the Rust binary via `rust-embed` at a temporary preview route, and bring the Dashboard panel (system info, health, live metrics) to full parity with `playground.html`'s dashboard — proving the whole scaffold → build → embed → serve → test pipeline works before any other panel is migrated.

**Architecture:** A Vite + React + TypeScript SPA in `web/`, styled with Tailwind v4 + shadcn/ui (`new-york` style) using CSS variables ported 1:1 from `playground.html`'s existing light/dark theme tokens. The built `web/dist/` is embedded into the Rust binary via `rust-embed` and served at `/preview` (temporary) and under the permanent static-asset prefix `/assets/app/*`. `/playground` and `/` are untouched in this plan — they keep serving the current `playground.html` unmodified until the final cutover plan.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix base), TanStack Query (REST caching), uPlot (real-time charts), Vitest + Testing Library (unit tests), `rust-embed` (Rust-side embedding), Playwright (E2E, existing suite).

**Spec:** `docs/superpowers/specs/2026-09-13-frontend-react-migration-design.md`

## Global Constraints

- No backend API contract changes — this plan only adds new routes (`/preview`, `/assets/app/*`); it must not modify or remove any existing route, response shape, or the existing `/playground` and `/` handlers.
- `web/node_modules/` and `web/dist/` must never be committed — both are build artifacts.
- `cargo build`/`cargo test` must keep working with zero Node.js installed — the FE build only runs via `make web`, never from `build.rs` or as a `cargo` build dependency.
- Auth is off by default (`config.toml` `[auth] enabled = false`) but the FE API layer must still attach `Authorization: Bearer <token>` when a token is present in `localStorage` under key `ki_auth_token`, matching how the server's `AuthMiddleware` expects it when auth is enabled in production. No login UI is in scope (the current playground has none either — parity, not a new feature).
- Theme tokens (light + dark) must be copied verbatim from `src/api/playground.html`'s `:root` (lines ~10-30) and `[data-theme="dark"]` (lines 573-599) blocks — values given in Task 2 below are already the exact copies.
- Every new React module gets a colocated Vitest test file (`*.test.ts` / `*.test.tsx`); no exceptions for "trivial" files.

---

### Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: `web/package.json`
- Create: `web/vite.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/tsconfig.node.json`
- Create: `web/index.html`
- Create: `web/src/main.tsx`
- Create: `web/src/App.tsx`
- Create: `web/src/App.test.tsx`
- Create: `web/src/test-setup.ts`
- Create: `web/src/vite-env.d.ts`
- Create: `web/.gitignore`
- Modify: `.gitignore` (repo root)

**Interfaces:**
- Produces: `web/` is a self-contained npm project; `npm run build` emits `web/dist/index.html` + `web/dist/assets/*`. `npm test` runs Vitest once (CI mode). `App` component (default export from `web/src/App.tsx`) is the root — later tasks replace its body but must keep the default export signature `function App(): JSX.Element`.

- [ ] **Step 1: Create `web/package.json`**

```json
{
  "name": "torch-inference-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tanstack/react-query": "^5.59.0",
    "uplot": "^1.6.31",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.454.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.9",
    "vitest": "^2.1.3",
    "jsdom": "^25.0.1",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.2",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

- [ ] **Step 2: Create `web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `web/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `web/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// base matches the permanent embedded-asset route `/assets/app/*` that
// src/api/web_assets.rs serves — kept identical in dev and prod builds so
// no path rewriting is needed at cutover time (see Task 8).
export default defineConfig({
  base: "/assets/app/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    proxy: {
      "/system": "http://localhost:8000",
      "/health": "http://localhost:8000",
      "/dashboard": "http://localhost:8000",
      "/performance": "http://localhost:8000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

- [ ] **Step 5: Create `web/src/test-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Create `web/src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 7: Create `web/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Torch Inference Engine</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `web/src/App.tsx` (placeholder, replaced in Task 5)**

```tsx
export default function App() {
  return <div data-testid="app-root">Torch Inference Engine</div>;
}
```

- [ ] **Step 9: Create `web/src/App.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the root app container", () => {
    render(<App />);
    expect(screen.getByTestId("app-root")).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Create `web/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element not found in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

This imports `./styles/globals.css`, which does not exist yet — that is created in Task 2. Do not run `npm run build` until Task 2's Step 1 is done; `npm run test` (Vitest) works fine without it since tests don't load `main.tsx`.

- [ ] **Step 11: Create `web/.gitignore`**

```
node_modules/
dist/
*.local
```

- [ ] **Step 12: Add `web/` build artifacts to the repo-root `.gitignore`**

Open `.gitignore` at the repo root and add, near the existing `/target/` and `node_modules/` entries:

```
web/node_modules/
web/dist/
```

- [ ] **Step 13: Install dependencies and run the test suite**

Run: `cd web && npm install && npm run test`
Expected: Vitest reports 1 passed test (`App > renders the root app container`).

- [ ] **Step 14: Commit**

```bash
git add web/package.json web/package-lock.json web/tsconfig.json web/tsconfig.node.json web/vite.config.ts web/index.html web/src/main.tsx web/src/App.tsx web/src/App.test.tsx web/src/test-setup.ts web/src/vite-env.d.ts web/.gitignore .gitignore
git commit -m "web: scaffold Vite + React + TypeScript + Vitest project"
```

---

### Task 2: Tailwind v4 + shadcn/ui setup with ported theme tokens

**Files:**
- Create: `web/src/styles/globals.css`
- Create: `web/components.json`
- Create: `web/src/lib/utils.ts` (shadcn's `cn()` helper — generated by `shadcn init`, verify content matches below)
- Modify: `web/src/App.tsx` (temporary smoke-test render of a shadcn `Button`, replaced in Task 5)
- Modify: `web/src/App.test.tsx`

**Interfaces:**
- Produces: `cn(...)` from `@/lib/utils` — `(...inputs: ClassValue[]) => string`, used by every shadcn component and by our own components going forward.
- Produces: CSS custom properties `--color-background`, `--color-foreground`, `--color-card`, `--color-card-foreground`, `--color-border`, `--color-input`, `--color-ring`, `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--radius`, toggled by `[data-theme="dark"]` on `<html>` — later tasks (and eventually the ported theme-toggle button) set this attribute exactly as `playground.html` does today (`document.documentElement.setAttribute('data-theme', ...)`, value persisted to `localStorage['theme']`).

- [ ] **Step 1: Create `web/src/styles/globals.css` with tokens ported from `playground.html`**

Values below are copied verbatim from `src/api/playground.html`'s `:root` block (line ~10) and `[data-theme="dark"]` block (line 573).

```css
@import "tailwindcss";

:root {
  --color-background: #f0f0f0;
  --color-foreground: #121212;
  --color-card: #ffffff;
  --color-card-foreground: #121212;
  --color-border: #e2e2e2;
  --color-input: #e2e2e2;
  --color-ring: #121212;
  --color-primary: #121212;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f8f8f8;
  --color-secondary-foreground: #121212;
  --color-muted: #f8f8f8;
  --color-muted-foreground: #404040;
  --color-accent: #f0f0f0;
  --color-accent-foreground: #121212;
  --color-destructive: #ff3131;
  --color-destructive-foreground: #ffffff;
  --color-success: #3abc3f;
  --color-success-foreground: #2e9632;
  --radius: 0.5rem;
}

:root[data-theme="dark"] {
  --color-background: #121212;
  --color-foreground: #e8e8e8;
  --color-card: #1a1a1a;
  --color-card-foreground: #e8e8e8;
  --color-border: #2a2a2a;
  --color-input: #2a2a2a;
  --color-ring: #e8e8e8;
  --color-primary: #e8e8e8;
  --color-primary-foreground: #121212;
  --color-secondary: #222222;
  --color-secondary-foreground: #e8e8e8;
  --color-muted: #1e1e1e;
  --color-muted-foreground: #888888;
  --color-accent: #1e1e1e;
  --color-accent-foreground: #e8e8e8;
  --color-destructive: #ff5555;
  --color-destructive-foreground: #121212;
  --color-success: #3abc3f;
  --color-success-foreground: #4ecb54;
}

@theme inline {
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-card: var(--color-card);
  --color-card-foreground: var(--color-card-foreground);
  --color-border: var(--color-border);
  --color-input: var(--color-input);
  --color-ring: var(--color-ring);
  --color-primary: var(--color-primary);
  --color-primary-foreground: var(--color-primary-foreground);
  --color-secondary: var(--color-secondary);
  --color-secondary-foreground: var(--color-secondary-foreground);
  --color-muted: var(--color-muted);
  --color-muted-foreground: var(--color-muted-foreground);
  --color-accent: var(--color-accent);
  --color-accent-foreground: var(--color-accent-foreground);
  --color-destructive: var(--color-destructive);
  --color-destructive-foreground: var(--color-destructive-foreground);
  --color-success: var(--color-success);
  --color-success-foreground: var(--color-success-foreground);
  --radius-sm: calc(var(--radius) * 0.75);
  --radius-md: calc(var(--radius) * 0.875);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.5);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

- [ ] **Step 2: Create `web/components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 3: Run shadcn init (non-interactive) and add the core components**

Run: `cd web && npx shadcn@latest init -d`
Run: `cd web && npx shadcn@latest add tabs card table badge sheet command alert-dialog dropdown-menu tooltip skeleton button`

Expected: `web/src/components/ui/` now contains `tabs.tsx`, `card.tsx`, `table.tsx`, `badge.tsx`, `sheet.tsx`, `command.tsx`, `alert-dialog.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `skeleton.tsx`, `button.tsx`, and `web/src/lib/utils.ts` exports a `cn()` function. `web/package.json` gained `radix-ui`, `tailwind-merge` (already present), `class-variance-authority` (already present) as dependencies if not already there.

- [ ] **Step 4: Verify `web/src/lib/utils.ts` matches the expected `cn()` contract**

Read the generated file and confirm it exports:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

If the generated file differs in import style but preserves this signature and behavior, leave it as generated (own the CLI's output, don't fight it).

- [ ] **Step 5: Temporarily smoke-test the theme + a shadcn component in `App.tsx`**

```tsx
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div data-testid="app-root" className="p-6">
      <Button>Torch Inference Engine</Button>
    </div>
  );
}
```

- [ ] **Step 6: Update `web/src/App.test.tsx` to match**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the root app container with a shadcn Button", () => {
    render(<App />);
    expect(screen.getByTestId("app-root")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Torch Inference Engine" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run tests and build**

Run: `cd web && npm run test`
Expected: 1 passed test.

Run: `cd web && npm run build`
Expected: succeeds, producing `web/dist/index.html` and `web/dist/assets/*.js` / `*.css` with `/assets/app/` as the base path baked into `index.html`'s script/link tags.

- [ ] **Step 8: Commit**

```bash
git add web/src/styles/globals.css web/components.json web/src/components/ui web/src/lib/utils.ts web/src/App.tsx web/src/App.test.tsx web/package.json web/package-lock.json
git commit -m "web: add Tailwind v4 + shadcn/ui, port playground theme tokens"
```

---

### Task 3: `lib/api-client.ts` — REST fetch wrapper

**Files:**
- Create: `web/src/lib/api-client.ts`
- Create: `web/src/lib/api-client.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks besides the project scaffold.
- Produces: `export class ApiError extends Error { status: number; body: unknown }`, `export async function apiGet<T>(path: string): Promise<T>`, `export async function apiPost<T>(path: string, data: unknown): Promise<T>`. Task 6/7 (Dashboard panel) import these directly.

- [ ] **Step 1: Write the failing tests**

```ts
// web/src/lib/api-client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiPost, ApiError } from "./api-client";

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

describe("apiGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("returns parsed JSON on 200", async () => {
    mockFetchOnce(200, { ok: true });
    const result = await apiGet<{ ok: boolean }>("/system/info");
    expect(result).toEqual({ ok: true });
  });

  it("does not send an Authorization header when no token is stored", async () => {
    mockFetchOnce(200, {});
    await apiGet("/system/info");
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = call[1].headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("sends a Bearer Authorization header when ki_auth_token is stored", async () => {
    localStorage.setItem("ki_auth_token", "test-token-123");
    mockFetchOnce(200, {});
    await apiGet("/system/info");
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = call[1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token-123");
  });

  it("throws ApiError with status and body on non-2xx", async () => {
    mockFetchOnce(503, { error: "unhealthy" });
    await expect(apiGet("/health")).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      body: { error: "unhealthy" },
    } satisfies Partial<ApiError>);
  });
});

describe("apiPost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("sends JSON body with Content-Type header and returns parsed response", async () => {
    mockFetchOnce(200, { accepted: true });
    const result = await apiPost<{ accepted: boolean }>("/predict", { x: 1 });
    expect(result).toEqual({ accepted: true });
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].method).toBe("POST");
    expect(call[1].body).toBe(JSON.stringify({ x: 1 }));
    expect((call[1].headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd web && npm run test -- api-client`
Expected: FAIL — `Cannot find module './api-client'`.

- [ ] **Step 3: Implement `web/src/lib/api-client.ts`**

```ts
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const AUTH_TOKEN_KEY = "ki_auth_token";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseErrorBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (!res.ok) {
    throw new ApiError(`GET ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new ApiError(`POST ${path} failed with ${res.status}`, res.status, await parseErrorBody(res));
  }
  return res.json() as Promise<T>;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd web && npm run test -- api-client`
Expected: 5 passed tests.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/api-client.ts web/src/lib/api-client.test.ts
git commit -m "web: add REST api-client with bearer-token support"
```

---

### Task 4: `lib/sse-client.ts` — `useEventSource` hook

**Files:**
- Create: `web/src/lib/sse-client.ts`
- Create: `web/src/lib/sse-client.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks besides the project scaffold.
- Produces: `export interface SseState<T> { data: T | null; connected: boolean; error: string | null }`, `export function useEventSource<T>(path: string, enabled?: boolean): SseState<T>`. Task 7 (MetricsChart) consumes this against `/dashboard/stream`.

- [ ] **Step 1: Write the failing tests**

```ts
// web/src/lib/sse-client.test.ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEventSource } from "./sse-client";

class MockEventSource {
  static instances: MockEventSource[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useEventSource", () => {
  it("starts disconnected with no data", () => {
    const { result } = renderHook(() => useEventSource("/dashboard/stream"));
    expect(result.current).toEqual({ data: null, connected: false, error: null });
  });

  it("marks connected on open and parses onmessage payloads", async () => {
    const { result } = renderHook(() => useEventSource<{ uptime_s: number }>("/dashboard/stream"));
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => source.onmessage?.({ data: JSON.stringify({ uptime_s: 42 }) }));
    await waitFor(() => expect(result.current.data).toEqual({ uptime_s: 42 }));
    expect(result.current.error).toBeNull();
  });

  it("marks disconnected on error", async () => {
    const { result } = renderHook(() => useEventSource("/dashboard/stream"));
    const source = MockEventSource.instances[0];

    act(() => source.onopen?.());
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => source.onerror?.());
    await waitFor(() => expect(result.current.connected).toBe(false));
  });

  it("closes the EventSource on unmount", () => {
    const { unmount } = renderHook(() => useEventSource("/dashboard/stream"));
    const source = MockEventSource.instances[0];
    unmount();
    expect(source.closed).toBe(true);
  });

  it("does not open a connection when enabled is false", () => {
    renderHook(() => useEventSource("/dashboard/stream", false));
    expect(MockEventSource.instances).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd web && npm run test -- sse-client`
Expected: FAIL — `Cannot find module './sse-client'`.

- [ ] **Step 3: Implement `web/src/lib/sse-client.ts`**

```ts
import { useEffect, useState } from "react";

export interface SseState<T> {
  data: T | null;
  connected: boolean;
  error: string | null;
}

export function useEventSource<T>(path: string, enabled = true): SseState<T> {
  const [state, setState] = useState<SseState<T>>({
    data: null,
    connected: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const source = new EventSource(path);

    source.onopen = () => {
      setState((prev) => ({ ...prev, connected: true, error: null }));
    };

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setState({ data: parsed, connected: true, error: null });
      } catch {
        setState((prev) => ({ ...prev, error: "failed to parse SSE payload" }));
      }
    };

    source.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    return () => {
      source.close();
    };
  }, [path, enabled]);

  return state;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd web && npm run test -- sse-client`
Expected: 5 passed tests.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/sse-client.ts web/src/lib/sse-client.test.ts
git commit -m "web: add useEventSource hook for SSE streams"
```

---

### Task 5: App shell — layout + Tabs-based panel navigation

**Files:**
- Create: `web/src/app/layout.tsx`
- Create: `web/src/app/layout.test.tsx`
- Modify: `web/src/App.tsx`
- Modify: `web/src/App.test.tsx`

**Interfaces:**
- Consumes: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs` (Task 2).
- Produces: `export interface Panel { id: string; label: string; content: ReactNode } export function AppLayout({ panels }: { panels: Panel[] }): JSX.Element`. Task 6/7 register the Dashboard panel here; later panel tasks append their own entries to the same `panels` array in `App.tsx`.
- Panel `id`s become the `TabsTrigger`/`TabsContent` `value` and are used as Playwright selectors (`[data-testid="panel-nav-<id>"]`, `[data-testid="panel-content-<id>"]`) — Task 9 depends on these exact `data-testid` conventions.

- [ ] **Step 1: Write the failing test for `AppLayout`**

```tsx
// web/src/app/layout.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./layout";

describe("AppLayout", () => {
  const panels = [
    { id: "dashboard", label: "Dashboard", content: <div>Dashboard content</div> },
    { id: "logs", label: "Logs", content: <div>Logs content</div> },
  ];

  it("renders a nav tab per panel and shows the first panel's content by default", () => {
    render(<AppLayout panels={panels} />);
    expect(screen.getByTestId("panel-nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("panel-nav-logs")).toBeInTheDocument();
    expect(screen.getByTestId("panel-content-dashboard")).toHaveTextContent("Dashboard content");
  });

  it("switches panel content when a nav tab is clicked", async () => {
    const user = userEvent.setup();
    render(<AppLayout panels={panels} />);
    await user.click(screen.getByTestId("panel-nav-logs"));
    expect(screen.getByTestId("panel-content-logs")).toHaveTextContent("Logs content");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd web && npm run test -- layout`
Expected: FAIL — `Cannot find module './layout'`.

- [ ] **Step 3: Implement `web/src/app/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Panel {
  id: string;
  label: string;
  content: ReactNode;
}

export function AppLayout({ panels }: { panels: Panel[] }) {
  if (panels.length === 0) {
    throw new Error("AppLayout requires at least one panel");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold">Torch Inference Engine</h1>
      </header>
      <Tabs defaultValue={panels[0].id} className="p-6">
        <TabsList>
          {panels.map((panel) => (
            <TabsTrigger key={panel.id} value={panel.id} data-testid={`panel-nav-${panel.id}`}>
              {panel.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {panels.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} data-testid={`panel-content-${panel.id}`}>
            {panel.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd web && npm run test -- layout`
Expected: 2 passed tests.

- [ ] **Step 5: Wire `AppLayout` into `web/src/App.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";

const queryClient = new QueryClient();

const panels: Panel[] = [
  { id: "dashboard", label: "Dashboard", content: <div>Dashboard panel coming in Task 6</div> },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 6: Update `web/src/App.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the Dashboard nav tab by default", () => {
    render(<App />);
    expect(screen.getByTestId("panel-nav-dashboard")).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the full test suite and build**

Run: `cd web && npm run test`
Expected: all tests pass (App, layout, api-client, sse-client).

Run: `cd web && npm run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add web/src/app/layout.tsx web/src/app/layout.test.tsx web/src/App.tsx web/src/App.test.tsx
git commit -m "web: add Tabs-based AppLayout shell wired into App"
```

---

### Task 6: Dashboard panel — system info card + health badge

**Files:**
- Create: `web/src/features/dashboard/types.ts`
- Create: `web/src/features/dashboard/SystemInfoCard.tsx`
- Create: `web/src/features/dashboard/SystemInfoCard.test.tsx`
- Create: `web/src/features/dashboard/HealthBadge.tsx`
- Create: `web/src/features/dashboard/HealthBadge.test.tsx`
- Create: `web/src/features/dashboard/DashboardPanel.tsx`
- Modify: `web/src/App.tsx`

**Interfaces:**
- Consumes: `apiGet` from `@/lib/api-client` (Task 3); `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`; `Badge` from `@/components/ui/badge`; `useQuery` from `@tanstack/react-query`.
- Produces: `export interface SystemInfo { ... }`, `export interface HealthCheck { ... }` (exact shapes below, matching `src/api/system.rs::SystemInfoResponse` and `src/api/health.rs::HealthCheck` field-for-field). `export function SystemInfoCard(): JSX.Element`, `export function HealthBadge(): JSX.Element`, `export function DashboardPanel(): JSX.Element` — Task 7 adds the metrics chart into `DashboardPanel`.

- [ ] **Step 1: Create `web/src/features/dashboard/types.ts`**

These mirror `src/api/system.rs` and `src/api/health.rs` exactly — field names and optionality must match the Rust `Serialize` structs.

```ts
export interface SystemDetails {
  os: string;
  arch: string;
  cpu_count: number;
  total_memory_bytes: number;
  total_memory_human: string;
  hostname: string | null;
}

export interface GpuDeviceInfo {
  id: number;
  name: string;
  total_memory: number;
  total_memory_human: string;
  free_memory: number;
  free_memory_human: string;
  utilization: number | null;
  temperature: number | null;
}

export interface GpuInfoDetails {
  available: boolean;
  count: number;
  devices: GpuDeviceInfo[];
}

export interface RuntimeDetails {
  version: string;
  build_date: string;
  rust_version: string;
  uptime_secs: number;
}

export interface FeatureFlags {
  cuda_enabled: boolean;
  onnx_enabled: boolean;
  torch_enabled: boolean;
  audio_processing: boolean;
  image_security: boolean;
}

export interface SystemInfo {
  system: SystemDetails;
  gpu: GpuInfoDetails;
  runtime: RuntimeDetails;
  features: FeatureFlags;
}

export interface ComponentHealth {
  status: string;
  message: string | null;
  latency_ms: number;
}

export interface HealthCheck {
  status: string;
  version: string;
  timestamp: string;
  uptime_seconds: number;
  checks: Record<string, ComponentHealth>;
  active_requests?: number;
  total_requests?: number;
  avg_latency_ms?: number;
  error_rate?: number;
}
```

- [ ] **Step 2: Write the failing test for `SystemInfoCard`**

```tsx
// web/src/features/dashboard/SystemInfoCard.test.tsx
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd web && npm run test -- SystemInfoCard`
Expected: FAIL — `Cannot find module './SystemInfoCard'`.

- [ ] **Step 4: Implement `web/src/features/dashboard/SystemInfoCard.tsx`**

```tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api-client";
import type { SystemInfo } from "./types";

export function SystemInfoCard() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["system-info"],
    queryFn: () => apiGet<SystemInfo>("/system/info"),
    refetchInterval: 30_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isPending && <Skeleton className="h-20 w-full" />}
        {isError && <p className="text-destructive">Failed to load system info.</p>}
        {data && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">OS</dt>
            <dd>{data.system.os} ({data.system.arch})</dd>
            <dt className="text-muted-foreground">CPU cores</dt>
            <dd>{data.system.cpu_count}</dd>
            <dt className="text-muted-foreground">Memory</dt>
            <dd>{data.system.total_memory_human}</dd>
            <dt className="text-muted-foreground">Runtime</dt>
            <dd>{data.runtime.version}</dd>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd web && npm run test -- SystemInfoCard`
Expected: 1 passed test.

- [ ] **Step 6: Write the failing test for `HealthBadge`**

```tsx
// web/src/features/dashboard/HealthBadge.test.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HealthBadge } from "./HealthBadge";
import type { HealthCheck } from "./types";

const healthyResponse: HealthCheck = {
  status: "healthy",
  version: "1.0.0",
  timestamp: "2026-09-13T00:00:00Z",
  uptime_seconds: 120,
  checks: {},
};

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("HealthBadge", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows a success-styled badge with the status text when healthy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => healthyResponse }),
    );
    renderWithClient(<HealthBadge />);
    await waitFor(() => expect(screen.getByText(/healthy/i)).toBeInTheDocument());
  });

  it("shows an unhealthy badge when the health endpoint 503s", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ ...healthyResponse, status: "unhealthy" }),
      }),
    );
    renderWithClient(<HealthBadge />);
    await waitFor(() => expect(screen.getByText(/unreachable/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `cd web && npm run test -- HealthBadge`
Expected: FAIL — `Cannot find module './HealthBadge'`.

- [ ] **Step 8: Implement `web/src/features/dashboard/HealthBadge.tsx`**

`apiGet` throws `ApiError` on non-2xx (including the 503 `/health` returns when unhealthy — see `src/api/health.rs`), so the 503 case surfaces through `isError`, not `data.status`.

```tsx
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api-client";
import type { HealthCheck } from "./types";

export function HealthBadge() {
  const { data, isError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<HealthCheck>("/health"),
    refetchInterval: 10_000,
  });

  if (isError) {
    return <Badge variant="destructive">unreachable</Badge>;
  }
  if (!data) {
    return <Badge variant="secondary">checking…</Badge>;
  }
  return (
    <Badge variant={data.status === "healthy" ? "default" : "destructive"}>{data.status}</Badge>
  );
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `cd web && npm run test -- HealthBadge`
Expected: 2 passed tests.

- [ ] **Step 10: Create `web/src/features/dashboard/DashboardPanel.tsx`**

```tsx
import { HealthBadge } from "./HealthBadge";
import { SystemInfoCard } from "./SystemInfoCard";

export function DashboardPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium">Status</h2>
        <HealthBadge />
      </div>
      <SystemInfoCard />
    </div>
  );
}
```

- [ ] **Step 11: Wire `DashboardPanel` into `web/src/App.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout, type Panel } from "@/app/layout";
import { DashboardPanel } from "@/features/dashboard/DashboardPanel";

const queryClient = new QueryClient();

const panels: Panel[] = [{ id: "dashboard", label: "Dashboard", content: <DashboardPanel /> }];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout panels={panels} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 12: Run the full suite and build**

Run: `cd web && npm run test`
Expected: all tests pass.

Run: `cd web && npm run build`
Expected: succeeds.

- [ ] **Step 13: Commit**

```bash
git add web/src/features/dashboard web/src/App.tsx
git commit -m "web: add Dashboard panel with SystemInfoCard and HealthBadge"
```

---

### Task 7: Dashboard panel — live metrics chart via uPlot + `/dashboard/stream`

**Files:**
- Create: `web/src/features/dashboard/metrics-buffer.ts`
- Create: `web/src/features/dashboard/metrics-buffer.test.ts`
- Create: `web/src/features/dashboard/MetricsChart.tsx`
- Create: `web/src/features/dashboard/MetricsChart.test.tsx`
- Modify: `web/src/features/dashboard/types.ts`
- Modify: `web/src/features/dashboard/DashboardPanel.tsx`

**Interfaces:**
- Consumes: `useEventSource` from `@/lib/sse-client` (Task 4).
- Produces: `export interface DashboardEvent { metrics: DashboardMetrics; gpu: DashboardGpu[]; downloads: DashboardDownload[] }` matching `src/api/dashboard.rs` field-for-field. `export function pushMetricSample(buffer: MetricsBuffer, event: DashboardEvent): MetricsBuffer` — a pure ring-buffer accumulator, unit-tested directly since uPlot's canvas rendering itself is not meaningfully unit-testable. `export function MetricsChart(): JSX.Element`.

- [ ] **Step 1: Add `DashboardEvent` types to `web/src/features/dashboard/types.ts`**

Append (do not replace existing content) — these mirror `src/api/dashboard.rs::DashboardEvent` exactly:

```ts
export interface DashboardMetrics {
  uptime_s: number;
  active_req: number;
  total_req: number;
  avg_latency_ms: number;
  error_rate: number;
  throughput_per_s: number;
  cpu_pct: number;
  mem_used_mb: number;
  mem_total_mb: number;
}

export interface DashboardGpu {
  name: string;
  util_pct: number | null;
  temp_c: number | null;
  vram_free_mb: number;
  vram_total_mb: number;
}

export interface DashboardDownload {
  id: string;
  model_name: string;
  status: string;
  progress: number;
  downloaded_mb: number;
  total_mb: number | null;
}

export interface DashboardEvent {
  metrics: DashboardMetrics;
  gpu: DashboardGpu[];
  downloads: DashboardDownload[];
}
```

- [ ] **Step 2: Write the failing test for the ring-buffer accumulator**

```ts
// web/src/features/dashboard/metrics-buffer.test.ts
import { describe, expect, it } from "vitest";
import { createMetricsBuffer, pushMetricSample, MAX_SAMPLES } from "./metrics-buffer";
import type { DashboardEvent } from "./types";

function makeEvent(cpu: number, uptimeSec: number): DashboardEvent {
  return {
    metrics: {
      uptime_s: uptimeSec,
      active_req: 0,
      total_req: 0,
      avg_latency_ms: 0,
      error_rate: 0,
      throughput_per_s: 0,
      cpu_pct: cpu,
      mem_used_mb: 0,
      mem_total_mb: 0,
    },
    gpu: [],
    downloads: [],
  };
}

describe("pushMetricSample", () => {
  it("appends a [uptime_s, cpuPct] pair", () => {
    const buffer = createMetricsBuffer();
    const next = pushMetricSample(buffer, makeEvent(42, 1));
    expect(next.timestamps).toEqual([1]);
    expect(next.cpuPct).toEqual([42]);
  });

  it("caps the buffer at MAX_SAMPLES, dropping the oldest sample", () => {
    let buffer = createMetricsBuffer();
    for (let i = 0; i < MAX_SAMPLES + 5; i++) {
      buffer = pushMetricSample(buffer, makeEvent(i, i));
    }
    expect(buffer.timestamps).toHaveLength(MAX_SAMPLES);
    expect(buffer.cpuPct[0]).toBe(5); // first 5 samples evicted
    expect(buffer.cpuPct.at(-1)).toBe(MAX_SAMPLES + 4);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd web && npm run test -- metrics-buffer`
Expected: FAIL — `Cannot find module './metrics-buffer'`.

- [ ] **Step 4: Implement `web/src/features/dashboard/metrics-buffer.ts`**

The timestamp axis is derived from `event.metrics.uptime_s` (deterministic, server-provided) rather than `Date.now()`, so the accumulator is a pure function of its inputs and fully unit-testable without faking the clock.

```ts
import type { DashboardEvent } from "./types";

export const MAX_SAMPLES = 120; // 3s tick interval * 120 = 6 minutes of history

export interface MetricsBuffer {
  timestamps: number[];
  cpuPct: number[];
}

export function createMetricsBuffer(): MetricsBuffer {
  return { timestamps: [], cpuPct: [] };
}

export function pushMetricSample(buffer: MetricsBuffer, event: DashboardEvent): MetricsBuffer {
  const timestamps = [...buffer.timestamps, event.metrics.uptime_s];
  const cpuPct = [...buffer.cpuPct, event.metrics.cpu_pct];

  if (timestamps.length > MAX_SAMPLES) {
    timestamps.shift();
    cpuPct.shift();
  }

  return { timestamps, cpuPct };
}
```

The test's `makeEvent(cpu, uptimeSec)` helper sets `metrics.uptime_s` directly from its second argument, so both tests drive the timestamp axis explicitly and deterministically — no fake clock needed.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd web && npm run test -- metrics-buffer`
Expected: 2 passed tests.

- [ ] **Step 6: Write the failing test for `MetricsChart`**

```tsx
// web/src/features/dashboard/MetricsChart.test.tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricsChart } from "./MetricsChart";

class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string) {}
  close() {}
}

afterEach(() => vi.unstubAllGlobals());

describe("MetricsChart", () => {
  it("shows a waiting state before the first SSE sample arrives", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    render(<MetricsChart />);
    expect(screen.getByText(/waiting for metrics/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `cd web && npm run test -- MetricsChart`
Expected: FAIL — `Cannot find module './MetricsChart'`.

- [ ] **Step 8: Implement `web/src/features/dashboard/MetricsChart.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useEventSource } from "@/lib/sse-client";
import { createMetricsBuffer, pushMetricSample, type MetricsBuffer } from "./metrics-buffer";
import type { DashboardEvent } from "./types";

export function MetricsChart() {
  const { data } = useEventSource<DashboardEvent>("/dashboard/stream");
  const [buffer, setBuffer] = useState<MetricsBuffer>(createMetricsBuffer());
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  useEffect(() => {
    if (data) {
      setBuffer((prev) => pushMetricSample(prev, data));
    }
  }, [data]);

  useEffect(() => {
    if (!containerRef.current || buffer.timestamps.length === 0) {
      return;
    }

    if (!plotRef.current) {
      plotRef.current = new uPlot(
        {
          width: containerRef.current.clientWidth,
          height: 200,
          series: [{}, { label: "CPU %", stroke: "var(--color-primary)" }],
        },
        [buffer.timestamps, buffer.cpuPct],
        containerRef.current,
      );
    } else {
      plotRef.current.setData([buffer.timestamps, buffer.cpuPct]);
    }
  }, [buffer]);

  useEffect(() => {
    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, []);

  if (buffer.timestamps.length === 0) {
    return <p className="text-muted-foreground text-sm">Waiting for metrics…</p>;
  }

  return <div ref={containerRef} data-testid="metrics-chart" />;
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `cd web && npm run test -- MetricsChart`
Expected: 1 passed test.

- [ ] **Step 10: Wire `MetricsChart` into `DashboardPanel`**

```tsx
import { HealthBadge } from "./HealthBadge";
import { MetricsChart } from "./MetricsChart";
import { SystemInfoCard } from "./SystemInfoCard";

export function DashboardPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium">Status</h2>
        <HealthBadge />
      </div>
      <SystemInfoCard />
      <MetricsChart />
    </div>
  );
}
```

- [ ] **Step 11: Run the full suite and build**

Run: `cd web && npm run test`
Expected: all tests pass.

Run: `cd web && npm run build`
Expected: succeeds.

- [ ] **Step 12: Commit**

```bash
git add web/src/features/dashboard
git commit -m "web: add live CPU metrics chart via uPlot + /dashboard/stream SSE"
```

---

### Task 8: Rust — embed `web/dist/` and serve it at `/preview` + `/assets/app/*`

**Files:**
- Modify: `Cargo.toml`
- Create: `src/api/web_assets.rs`
- Modify: `src/api/mod.rs`
- Modify: `src/api/handlers.rs`
- Modify: `src/main.rs`

**Interfaces:**
- Produces: `pub fn configure_routes(cfg: &mut actix_web::web::ServiceConfig)` in `src/api/web_assets.rs`, registering `GET /preview` and `GET /assets/app/{filename:.*}`. Registered from `src/main.rs` alongside the other `.configure(...)` calls (does not touch `handlers::configure_routes`, which keeps owning `/` and `/playground` unchanged).
- Consumes: `web/dist/` at compile time via `rust_embed::RustEmbed`. If `web/dist/` does not exist when `cargo build` runs, the crate fails to compile — this is intentional (forces `make web` first) and is called out in Task 9's Makefile change.

- [ ] **Step 1: Add the `rust-embed` dependency**

In `Cargo.toml`, under the existing `# File operations` group (after `bytes = "1.5"`), add:

```toml
# Frontend embedding — the built web/dist/ SPA bundle, embedded into the binary
rust-embed = "8"
```

- [ ] **Step 2: Create `src/api/web_assets.rs`**

```rust
use actix_web::{web, HttpRequest, HttpResponse, Responder};
use rust_embed::RustEmbed;
use sha2::Digest;
use std::collections::HashMap;
use std::sync::OnceLock;

/// The built React/Vite SPA (`web/dist/`), embedded at compile time.
/// Requires `make web` to have run first — see the Makefile `web` target.
#[derive(RustEmbed)]
#[folder = "web/dist/"]
struct WebDist;

static ETAGS: OnceLock<HashMap<String, String>> = OnceLock::new();

fn etags() -> &'static HashMap<String, String> {
    ETAGS.get_or_init(|| {
        WebDist::iter()
            .map(|path| {
                let bytes = WebDist::get(&path).expect("path came from WebDist::iter").data;
                let hash = sha2::Sha256::digest(bytes.as_ref());
                let hex: String = hash.iter().map(|b| format!("{:02x}", b)).collect();
                (path.to_string(), format!("\"{}\"", hex))
            })
            .collect()
    })
}

/// Content-type for the small set of file types Vite's build emits.
/// Extend this list if a later panel introduces a new asset extension.
fn content_type_for(path: &str) -> &'static str {
    if path.ends_with(".html") {
        "text/html; charset=utf-8"
    } else if path.ends_with(".js") {
        "text/javascript; charset=utf-8"
    } else if path.ends_with(".css") {
        "text/css; charset=utf-8"
    } else if path.ends_with(".svg") {
        "image/svg+xml"
    } else if path.ends_with(".png") {
        "image/png"
    } else if path.ends_with(".woff2") {
        "font/woff2"
    } else if path.ends_with(".json") {
        "application/json; charset=utf-8"
    } else {
        "application/octet-stream"
    }
}

fn serve_embedded(path: &str, cache_control: &str, req: &HttpRequest) -> HttpResponse {
    let Some(file) = WebDist::get(path) else {
        return HttpResponse::NotFound().finish();
    };
    let etag = etags()
        .get(path)
        .map(String::as_str)
        .unwrap_or("\"unknown\"");

    if let Some(inm) = req.headers().get("if-none-match") {
        if inm.to_str().unwrap_or("") == etag {
            return HttpResponse::NotModified().insert_header(("ETag", etag)).finish();
        }
    }

    HttpResponse::Ok()
        .content_type(content_type_for(path))
        .insert_header(("ETag", etag))
        .insert_header(("Cache-Control", cache_control))
        .body(file.data.into_owned())
}

/// Temporary preview route for the in-progress React frontend. Removed at
/// cutover, when `/` and `/playground` serve this same `index.html` instead.
pub async fn serve_preview(req: HttpRequest) -> impl Responder {
    serve_embedded("index.html", "no-cache", &req)
}

/// Permanent static-asset route for the embedded SPA's hashed JS/CSS/etc.
/// Vite's `base: "/assets/app/"` (see `web/vite.config.ts`) makes every
/// asset reference in `index.html` point here.
pub async fn serve_app_asset(req: HttpRequest, filename: web::Path<String>) -> impl Responder {
    let path = filename.into_inner();
    serve_embedded(&path, "public, max-age=31536000, immutable", &req)
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.route("/preview", web::get().to(serve_preview))
        .route("/assets/app/{filename:.*}", web::get().to(serve_app_asset));
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test as actix_test, App};

    #[actix_web::test]
    async fn test_preview_serves_index_html() {
        let app = actix_test::init_service(App::new().configure(configure_routes)).await;
        let req = actix_test::TestRequest::get().uri("/preview").to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200);
    }

    #[actix_web::test]
    async fn test_unknown_asset_returns_404() {
        let app = actix_test::init_service(App::new().configure(configure_routes)).await;
        let req = actix_test::TestRequest::get()
            .uri("/assets/app/does-not-exist.js")
            .to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 404);
    }
}
```

- [ ] **Step 3: Register the module in `src/api/mod.rs`**

Add alongside the existing `pub mod assets;` line:

```rust
pub mod web_assets;
```

- [ ] **Step 4: Register the routes in `src/main.rs`**

Find the `.configure(crate::api::ws_infer::configure_routes)` line (part of the `App::new()` chain) and add immediately after it:

```rust
            .configure(crate::api::ws_infer::configure_routes)
            .configure(crate::api::web_assets::configure_routes)
```

- [ ] **Step 5: Build `web/dist/` so the crate can compile, then build and test**

Run: `cd web && npm run build && cd ..`
Expected: `web/dist/index.html` exists.

Run: `cargo build --no-default-features --features production 2>&1 | tail -40`
Expected: compiles successfully (this workspace requires `libtorch`/ONNX setup per `CLAUDE.md`; if the build fails for reasons unrelated to `web_assets.rs` — e.g. missing `libtorch` — note it and proceed to `cargo test --lib api::web_assets` instead, which only needs the crate to compile its library target).

Run: `cargo test --lib api::web_assets:: -- --nocapture`
Expected: `test_preview_serves_index_html` and `test_unknown_asset_returns_404` both pass.

- [ ] **Step 6: Commit**

```bash
git add Cargo.toml Cargo.lock src/api/web_assets.rs src/api/mod.rs src/main.rs
git commit -m "server: embed web/dist/ via rust-embed, serve at /preview + /assets/app/*"
```

---

### Task 9: `make web` target + end-to-end manual verification

**Files:**
- Modify: `Makefile`

**Interfaces:**
- Produces: `make web` target — no other task depends on its exact implementation beyond "produces `web/dist/`".

- [ ] **Step 1: Add the `web` target to `Makefile`**

Add near the other build-related targets (after `build:`):

```makefile
web: ## Build the React frontend (required before `cargo build` picks up web/dist/)
	@echo "Building frontend..."
	cd web && npm ci && npm run build
	@echo "✅ Frontend build complete: ./web/dist/"
```

- [ ] **Step 2: Verify the full pipeline from a clean state**

Run: `rm -rf web/dist && make web`
Expected: `web/dist/index.html` exists again.

Run: `cargo build --no-default-features --features production`
Expected: compiles (same caveat as Task 8 Step 5 regarding `libtorch`/ONNX availability in this environment).

Run: the built server (`./target/release/torch-inference-server` or `make dev`), then in another shell: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/preview`
Expected: `200`.

Run: `curl -s -D - -o /dev/null http://localhost:8000/preview | grep -i etag`
Expected: an `ETag` header is present.

- [ ] **Step 3: Commit**

```bash
git add Makefile
git commit -m "build: add make web target for the frontend build"
```

---

### Task 10: Playwright coverage for the new Dashboard panel at `/preview`

**Files:**
- Create: `tests/playwright/tests/dashboard-react.spec.js`
- Modify: `tests/playwright/utils/selectors.js`

**Interfaces:**
- Consumes: nothing from other test files — this is a new, additive spec. Does not modify or remove any existing `playground.html` selectors or specs (those stay valid until the cutover plan deletes `playground.html`).

- [ ] **Step 1: Add new-FE selectors to `tests/playwright/utils/selectors.js`**

Add a new exported block, without touching the existing `playground.html` selectors above it:

```js
  // ── New React frontend (web/) — served at /preview until cutover ──
  reactNavDashboard:    '[data-testid="panel-nav-dashboard"]',
  reactPanelDashboard:  '[data-testid="panel-content-dashboard"]',
  reactMetricsChart:    '[data-testid="metrics-chart"]',
```

- [ ] **Step 2: Create `tests/playwright/tests/dashboard-react.spec.js`**

```js
const { test, expect } = require('@playwright/test');
const selectors = require('../utils/selectors');

test.describe('React Dashboard panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
  });

  test('shows the Dashboard tab selected by default', async ({ page }) => {
    await expect(page.locator(selectors.reactNavDashboard)).toBeVisible();
    await expect(page.locator(selectors.reactPanelDashboard)).toBeVisible();
  });

  test('renders system OS info fetched from /system/info', async ({ page }) => {
    const panel = page.locator(selectors.reactPanelDashboard);
    await expect(panel).toContainText(/darwin|linux|windows/i, { timeout: 10000 });
  });

  test('renders the live metrics chart once /dashboard/stream emits a sample', async ({ page }) => {
    await expect(page.locator(selectors.reactMetricsChart)).toBeVisible({ timeout: 10000 });
  });
});
```

- [ ] **Step 3: Run the new spec against a running server**

Precondition: the server from Task 9 Step 2 is running on `http://localhost:8000`.

Run: `cd tests/playwright && npx playwright test dashboard-react.spec.js`
Expected: 3 passed tests.

- [ ] **Step 4: Commit**

```bash
git add tests/playwright/tests/dashboard-react.spec.js tests/playwright/utils/selectors.js
git commit -m "test: add Playwright coverage for the React Dashboard panel"
```

---

## Self-Review Notes

- **Spec coverage:** This plan implements spec Section 1 (framework choice — realized in Task 1/2), Section 2 (folder layout — Task 1), Section 3 (data flow, dashboard slice — Tasks 3/4/6/7), Section 4 (build → embed — Tasks 8/9), and the first entry of Section 5's migration order (Task 6/7/10). Remaining Section 5 panels (Logs, TTS/STT, Classify/Detect, Chat, API Reference) and Section 5 Step 8 (cutover) are out of scope for this plan and will be separate plans, per the writing-plans skill's guidance to decompose independent subsystems.
- **Type consistency check:** `SystemInfo`/`HealthCheck`/`DashboardEvent` field names in `web/src/features/dashboard/types.ts` were verified against the actual Rust structs (`src/api/system.rs`, `src/api/health.rs`, `src/api/dashboard.rs`) rather than assumed from the spec — the spec did not enumerate exact fields.
- **No placeholders:** every code step above contains complete, runnable file content; CLI-driven steps (shadcn init/add) specify exact commands and verifiable outcomes instead of hand-guessed generated file contents.
