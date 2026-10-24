// Copyright (c) 2026 Torviello.
// Functional design F-07 (0026 contract) — the terminal demo renders the
// documented engine session as real text nodes; animation is decorative and
// static under reduced motion.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import TerminalDemo from "./TerminalDemo.svelte";

const lines = [
  { kind: "prompt", text: "torviello-engine --help" },
  { kind: "prompt", text: "TORCH_PORT=8000 torviello-engine" },
  {
    kind: "status",
    text:
      '{"event":"startup","version":"1.0.0","correlation_id":"…","message":"engine started"}',
  },
] as const;

test("terminal renders the documented engine session as selectable text", () => {
  const html = render(TerminalDemo, { props: { lines: [...lines] } }).html;
  expect(html).toContain(">torviello-engine --help</span>");
  expect(html).toContain(">TORCH_PORT=8000 torviello-engine</span>");
  expect(html).toContain('message":"engine started"}</span>');
  expect(html).not.toContain("pip");
  expect(html).not.toContain("serve --model");
  expect(html).not.toMatch(/<img|<canvas|background-image/);
});

test("terminal markers stay decorative and distinct per kind", () => {
  const html = render(TerminalDemo, { props: { lines: [...lines] } }).html;
  expect(html.match(/aria-hidden="true">\$</g)).toHaveLength(2);
  expect(html.match(/aria-hidden="true">•</g)).toHaveLength(1);
});

test("terminal window chrome is decorative", () => {
  const html = render(TerminalDemo, { props: { lines: [...lines] } }).html;
  expect(html).toContain('tv-terminal__chrome" aria-hidden="true"');
});
