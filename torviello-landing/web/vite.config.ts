import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// The Svelte plugin is imported lazily: some config bundlers drop the named
// static import during config transformation, so resolve it at config time.
export default defineConfig(async () => {
  const { svelte } = await import("@sveltejs/vite-plugin-svelte");
  return {
    plugins: [svelte()],
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
