// Copyright (c) 2026 Torviello.
// Sheet A1/A2 — ported from the 0020 React suite to the Svelte stack.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import Button from "./Button.svelte";

test("button exposes idle loading and disabled semantics", () => {
  const idle = render(Button, { props: { label: "Run" } }).html;
  expect(idle).toContain('data-state="idle"');
  expect(idle).toContain('aria-busy="false"');
  expect(idle).toContain("tv-button--primary");

  const loading = render(Button, { props: { label: "Run", state: "loading" } }).html;
  expect(loading).toContain('data-state="loading"');
  expect(loading).toContain('aria-busy="true"');
  expect(loading).toContain('aria-disabled="true"');
});

test("button renders the ghost variant for secondary actions", () => {
  const ghost = render(Button, {
    props: { label: "View on GitHub", variant: "ghost" },
  }).html;
  expect(ghost).toContain("tv-button--ghost");
  expect(ghost).not.toContain("tv-button--primary");

  const primary = render(Button, { props: { label: "Get Started" } }).html;
  expect(primary).toContain("tv-button--primary");
  expect(primary).not.toContain("tv-button--ghost");
});

test("button renders its label as real text", () => {
  const html = render(Button, { props: { label: "Run" } }).html;
  expect(html).toContain(">Run</button>");
});

test("button pairs an icon with its label per house rule 10", () => {
  const html = render(Button, {
    props: { label: "Get Started", icon: "arrow-right" },
  }).html;
  const before = html.indexOf('class="tv-icon"');
  expect(before).toBeGreaterThan(-1);
  expect(before).toBeLessThan(html.indexOf(">Get Started</button>"));
  expect(html).toContain('aria-hidden="true"');
});
