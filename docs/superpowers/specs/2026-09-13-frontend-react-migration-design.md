# Frontend Migration: playground.html → React/Vite/shadcn in `web/`

**Goal:** Replace the single 6,248-line, 302KB `src/api/playground.html` (vanilla JS, no build tooling, embedded via `include_str!`) with a proper React + TypeScript frontend in a new `web/` folder, built with Vite and styled with Tailwind + shadcn/ui, while keeping the frontend embedded in and served from the same Rust binary on the same origin.

**Scope:** Full rewrite of all current playground panels, cut over once parity is reached. No change to deployment topology — this stays a single-binary, single-origin server.

**Relationship to prior work:** Supersedes the "no build toolchain" non-goal in `2026-04-28-frontend-infrastructure-design.md`. That design's HTTP-caching approach (ETag / conditional 304s) and self-hosted-Remixicon-with-CDN-fallback pattern both carry forward conceptually into the new embedded-bundle serving path (Section 5).

---

## Section 1 — Why React + Vite + Tailwind + shadcn/ui

| Option | Fit | Trade-off |
|---|---|---|
| **React + TypeScript + Vite (chosen)** | Matches the user's existing primary frontend stack — no new mental model for a solo maintainer. Deepest ecosystem for what this dashboard needs: TanStack Query for REST caching, native `WebSocket`/`EventSource` for streaming, Vite for a trivially embeddable static `dist/`. | React+ReactDOM runtime (~45KB gzip) — irrelevant for a locally-served ops dashboard. |
| SolidJS + Vite | Smaller runtime, fine-grained reactivity suits high-frequency updates. | Discards existing React knowledge for no functional gain; thinner ecosystem. |
| Vue 3 + Vite | Mature, gentle curve. | Not part of the current stack; no real advantage over React here. |

**Component layer: shadcn/ui** (`new-york` style, Radix base) — chosen because its CSS-variable theming maps directly onto the tokens already defined in `playground.html`'s `:root` (`--bg`, `--surface`, `--border`, `--accent`, `--green`, `--red`, etc.), so the visual identity carries over instead of resetting. Its component set lines up with this dashboard's actual needs:

| Playground need | shadcn component |
|---|---|
| Panel navigation | `Tabs` |
| Structured logs table | `Table` |
| Dashboard/health summaries | `Card`, `Badge` |
| Mobile nav | `Sheet` |
| Quick actions / model search | `Command` |
| Destructive actions (unload model, clear cache) | `AlertDialog` |
| Row actions, settings menus | `DropdownMenu` |
| Loading states | `Skeleton` |

**Charts: uPlot**, not shadcn's Recharts-based chart wrapper or Chart.js. uPlot is canvas-based and purpose-built for high-frequency real-time time-series, which is what the performance-history and live audio/log streams need — SVG-based chart libs re-render too much under rapid ticks. Wrapped in one thin React component (`components/ui/chart-uplot.tsx`) rather than adopted as a general chart library.

---

## Section 2 — Folder layout

```
web/                              # new FE root — untouched by `cargo build`
  components.json                 # shadcn config (style: new-york, base: radix)
  tailwind.config.ts
  postcss.config.js
  index.html
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  src/
    main.tsx
    app/
      layout.tsx                  # shell: header, Tabs-based panel nav
      router.tsx                  # panel switch (no server routing needed — SPA)
    components/
      ui/                         # shadcn-generated components (owned source, not a dependency)
    features/
      dashboard/                  # system info, performance charts (uPlot)
      logs/                       # structured log table (SSE tail)
      tts/
      stt/
      classify/
      detect/
      chat/                       # LLM completions (SSE streaming)
      api-reference/              # Scalar mount, same CDN-fetch-with-fallback pattern as today
    lib/
      api-client.ts               # fetch wrapper: base URL, auth header, error envelope handling
      ws-client.ts                # WebSocket helpers (audio streaming, /ws/infer)
      sse-client.ts               # EventSource helpers (chat streaming, log tail)
      utils.ts                    # cn() and other shared helpers
    styles/
      globals.css                 # shadcn CSS variables, mapped from the existing theme tokens
  public/
    favicon.svg                   # same "KI" mark as today's inline data-URI icon
```

`tests/playwright/` is not moved — it stays at the repo root and is updated incrementally (see Section 6).

---

## Section 3 — Data flow / API integration

The new FE talks to the same endpoints the current playground.html already calls (`/health`, `/system/info`, `/metrics`, `/performance`, `/tts/*`, `/stt/*`, `/classify/*`, `/detect/*`, `/v1/chat/completions`, `/openapi.json`, plus the logging and WS/SSE endpoints). No backend API changes are in scope for this migration — this is a frontend-only rewrite.

- **REST (dashboard, classify, detect, TTS request/response):** `fetch` via `lib/api-client.ts`, wrapped with TanStack Query for caching/retry/loading states. Error envelope handling is centralized in one place instead of duplicated per panel as today.
- **WebSocket (bi-directional audio streaming, `/ws/infer`):** `lib/ws-client.ts` provides a small hook (`useWebSocketStream`) wrapping reconnect/backoff and message framing already implemented ad hoc in `playground.html`'s inline script.
- **SSE (chat completions, live log tail):** `lib/sse-client.ts` wraps `EventSource` with the same reconnect semantics.
- **API reference panel:** keeps using Scalar's standalone bundle exactly as `assets.rs` serves it today (CDN fetch at server startup with local fallback) — the React component just mounts it into a ref'd `<div>`, matching the current `renderApiRef()` behavior.

No new backend auth/CORS surface: same-origin embedded serving means the existing auth middleware (JWT, per `docs/AUTHENTICATION.md`) applies unchanged.

---

## Section 4 — Build → embed integration

Goals: keep `cargo build`/CI Node-free by default, keep single-binary single-port deployment, avoid re-architecting the asset-serving pattern more than necessary.

- **New Makefile targets:**
  - `make web` — `cd web && npm ci && npm run build`, producing `web/dist/`.
  - `build` / `dev` targets gain a prerequisite note (not an automatic dependency, to avoid forcing Node onto every Rust-only edit-compile-test loop) — CI pipelines run `make web` before `cargo build --release`.
- **`web/dist/` is gitignored**, same treatment as `libtorch/` — a fetched/built artifact, not committed.
- **Embedding:** add the `rust-embed` crate. Replace the single `include_str!("playground.html")` in `src/api/handlers.rs` with an embedded asset struct over `web/dist/` (multiple files now: JS/CSS bundles, `index.html`, any static assets). This is a mechanical swap of the existing `PLAYGROUND_HTML` constant + `playground_etag()` for a small embed-lookup handler; the existing SHA-256 ETag / `If-None-Match` 304 logic (`2026-04-28` design) is preserved, just computed per-embedded-file instead of over one string.
- **Routing:** `/playground` and `/` continue to serve `index.html` from the embedded bundle; a new catch-all (e.g. `/assets/app/*`) serves the rest of the embedded files (hashed JS/CSS chunks Vite produces). This is additive — it does not touch the existing `/assets/remixicon.*` or Scalar routes in `assets.rs`, which stay as-is.
- **Remixicon:** the new FE can either keep consuming `/assets/remixicon.css` exactly as today (zero change), or switch to the `remixicon` npm package bundled by Vite — deferred to implementation time as a minor call, not a design fork (behavior is identical either way; only the byte source differs).

---

## Section 5 — Migration execution order

Full rewrite, single cutover — but panels are built and validated in an order that surfaces integration risk (WS/SSE plumbing, auth headers, streaming backpressure) early rather than at the end, and each panel's Playwright coverage is ported alongside it rather than deferred:

1. **Scaffold + shell** — `npm create vite`, `shadcn init --template vite -d`, Tailwind config, map existing theme tokens into `globals.css`, add core components (`tabs card table badge sheet command alert-dialog dropdown-menu tooltip skeleton`), build `lib/api-client.ts`, app shell with Tabs nav. Wire into `rust-embed` + Makefile so the empty shell serves end-to-end through the real binary before any panel is built.
2. **Dashboard panel** — system/health/`/metrics`, first use of the uPlot wrapper for performance-history charts.
3. **Logs panel** — SSE tail + structured table (`Table` component); recently-built feature, good complexity test for the SSE client.
4. **TTS + STT panels** — bidirectional WS audio streaming, validates `ws-client.ts` against real audio framing.
5. **Classify + Detect panels** — file upload flows, live-stream backpressure handling (mirrors the recently-fixed `fix/detect-live-stream-backpressure` behavior — must not regress it).
6. **Chat/LLM panel** — SSE streaming completions.
7. **API reference panel** — Scalar mount; mechanically simplest, done last.
8. **Cutover** — swap `/playground` and `/` to serve the new embedded bundle, delete `src/api/playground.html`, the old `PLAYGROUND_HTML`/`include_str!` wiring, and (once nothing references it) the now-dead code path in `handlers.rs`, in the same commit/PR.

---

## Section 6 — Testing strategy

- `tests/playwright/` specs are updated **panel-by-panel alongside implementation**, not batched at the end — each step in Section 5 that touches a panel also updates that panel's spec and `tests/playwright/utils/selectors.js`.
- Because the DOM structure changes completely (shadcn markup vs. today's hand-rolled HTML), selectors are expected to change; this is treated as a rewrite of selectors, not a diff.
- `tests/jest/` (if it covers any FE logic rather than pure backend) is reviewed at scaffold time (Step 1) to determine whether its assertions move into the new FE's own unit tests (e.g., Vitest) or stay backend-focused — resolved during implementation, not blocking this design.
- No new backend integration tests are needed since no API contract changes.

---

## Section 7 — Non-goals

- No backend API changes.
- No change to deployment topology (still single binary, single origin, same auth model).
- No SSR/Next.js — this is a client-rendered SPA, matching the current playground's nature as an authenticated operator dashboard, not a public content site.
- No design-system registry/publishing (shadcn components are consumed locally, not published as a shared registry).
- No PWA/offline support beyond whatever falls out naturally from embedding (out of scope to design deliberately).

---

## Success criteria

- All panels in the current `playground.html` have a working equivalent in the new FE, verified via ported Playwright specs.
- Server still ships as a single binary; `web/dist/` is not present in the committed repo, only its build output is embedded at compile time.
- `playground.html` and its `include_str!` wiring are deleted after cutover — no dead code left behind.
- No regression in the two most recently fixed playground behaviors: detect live-stream backpressure, and STT VAD auto-segmentation.
