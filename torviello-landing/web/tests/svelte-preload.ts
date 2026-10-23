// Copyright (c) 2026 Torviello.
// Bun loader for Svelte single-file components, wired through bunfig [test]
// preload. Server-side rendering suites (the default) compile with
// generate: "server"; the DOM interaction category opts into the client
// runtime via SVELTE_COMPILE_MODE=client. The app itself builds through Vite.
import { readFileSync } from "node:fs";

import { compile } from "svelte/compiler";

const generate = process.env.SVELTE_COMPILE_MODE === "client" ? "client" : "server";

Bun.plugin({
  name: "svelte",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, (args) => {
      const source = readFileSync(args.path, "utf8");
      const { js, warnings } = compile(source, {
        filename: args.path,
        generate,
        runes: true,
      });
      for (const warning of warnings) {
        console.warn(`[svelte] ${args.path}: ${warning.message}`);
      }
      return { contents: js.code, loader: "js" };
    });
  },
});
