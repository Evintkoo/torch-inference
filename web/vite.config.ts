/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Overridable so `BACKEND_URL=http://localhost:8001 npm run dev` (or `make
// web-dev`) works against a server running on a non-default port instead of
// silently 404ing every API call.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// Every backend route prefix the frontend actually fetches (see api-client.ts
// call sites) — NOT just the Dashboard-era four. A route missing here doesn't
// error, it just quietly 404s under `npm run dev`, which is much harder to
// notice than a build failure.
const API_PROXY_PATHS = [
  "/system",
  "/health",
  "/dashboard",
  "/performance",
  "/tts",
  "/audio",
  "/classify",
  "/yolo",
  "/llm",
  "/logs",
  "/stt",
  "/predict",
  "/ws",
  "/v1",
  "/models",
];

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
    proxy: Object.fromEntries(
      API_PROXY_PATHS.map((p) => [p, { target: BACKEND_URL, ws: true }]),
    ),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    // Radix's Select popper positioning is slow under jsdom's synchronous
    // layout stubs (no real ResizeObserver/IntersectionObserver timing) —
    // an open-dropdown interaction alone can take several real seconds.
    testTimeout: 20000,
  },
});
