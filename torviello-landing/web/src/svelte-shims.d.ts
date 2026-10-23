// Copyright (c) 2026 Torviello.
// Type shim so tsc can typecheck .ts files importing Svelte components.
// Real component prop checking happens through the Vite build and the tests.
declare module "*.svelte" {
  import type { Component } from "svelte";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: Component<Record<string, any>>;
  export default component;
}

declare module "*.css";
