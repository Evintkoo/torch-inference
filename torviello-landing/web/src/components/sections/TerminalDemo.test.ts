// Copyright (c) 2026 Torviello.
// Functional design F-07 — the terminal demo renders the board transcript as
// real text nodes; animation is decorative and static under reduced motion.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import TerminalDemo from "./TerminalDemo.svelte";

const lines = [
  { kind: "prompt", text: "pip install torviello" },
  { kind: "prompt", text: "torviello serve --model my-model" },
  { kind: "status", text: "Loading model…" },
  { kind: "status", text: "Optimizing graph…" },
  { kind: "status", text: "Starting inference server…" },
  { kind: "status", text: "Ready 🚀" },
] as const;

test("terminal renders the board transcript as selectable text", () => {
  const html = render(TerminalDemo, { props: { lines: [...lines] } }).html;
  expect(html).toContain(">pip install torviello</span>");
  expect(html).toContain(">torviello serve --model my-model</span>");
  expect(html).toContain(">Loading model…</span>");
  expect(html).toContain(">Optimizing graph…</span>");
  expect(html).toContain(">Starting inference server…</span>");
  expect(html).toContain(">Ready 🚀</span>");
  expect(html).not.toMatch(/<img|<canvas|background-image/);
});

test("terminal markers stay decorative and distinct per kind", () => {
  const html = render(TerminalDemo, { props: { lines: [...lines] } }).html;
  expect(html.match(/aria-hidden="true">\$</g)).toHaveLength(2);
  expect(html.match(/aria-hidden="true">•</g)).toHaveLength(4);
});

test("terminal window chrome is decorative", () => {
  const html = render(TerminalDemo, { props: { lines: [...lines] } }).html;
  expect(html).toContain('tv-terminal__chrome" aria-hidden="true"');
});
