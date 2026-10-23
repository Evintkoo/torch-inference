import { defineConfig } from "vite";

// The Svelte plugin is imported lazily: some config bundlers drop the named
// static import during config transformation, so resolve it at config time.
export default defineConfig(async () => {
  const { svelte } = await import("@sveltejs/vite-plugin-svelte");
  return {
    plugins: [svelte()],
  };
});
