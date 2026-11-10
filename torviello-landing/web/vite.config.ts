/* Copyright (c) 2026 Torviello. */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// The Svelte plugin is imported lazily: some config bundlers drop the named
// static import during config transformation, so resolve it at config time.
export default defineConfig(async () => {
  const { svelte } = await import("@sveltejs/vite-plugin-svelte");
  return {
    plugins: [svelte()],
    // Relative asset base: the site must work under any mount path —
    // GitHub Pages serves the project site from /torch-inference/ (ticket
    // 0047), a VM serves it from / — without rebuilding per target.
    base: "./",
    resolve: {
      alias: {
        // GOV-12.07: design and media assets are imported from the owning unit.
        "@torviello/design": fileURLToPath(
          new URL("../../torviello-design", import.meta.url),
        ),
        "@torviello/media": fileURLToPath(
          new URL("../../torviello-media", import.meta.url),
        ),
      },
    },
  };
});