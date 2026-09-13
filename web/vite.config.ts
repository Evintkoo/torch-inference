/// <reference types="vitest/config" />
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
