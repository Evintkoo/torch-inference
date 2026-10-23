// Copyright (c) 2026 Torviello.
// Bun loader for Svelte single-file components, wired through bunfig [test] preload.
// Test suites render components server-side (svelte/server), so this compiles
// .svelte files with generate: "server". The app itself builds through Vite.
import { readFileSync } from "node:fs";

import { compile } from "svelte/compiler";

Bun.plugin({
  name: "svelte-ssr",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, (args) => {
      const source = readFileSync(args.path, "utf8");
      const { js, warnings } = compile(source, {
        filename: args.path,
        generate: "server",
        runes: true,
      });
      for (const warning of warnings) {
        console.warn(`[svelte] ${args.path}: ${warning.message}`);
      }
      return { contents: js.code, loader: "js" };
    });
  },
});
