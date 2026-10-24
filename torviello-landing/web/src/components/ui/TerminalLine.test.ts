// Copyright (c) 2026 Torviello.
// Sheet A6 — ported from the 0020 React suite to the Svelte stack.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import TerminalLine from "./TerminalLine.svelte";

test("terminal line renders a prompt line with a hidden marker", () => {
  const html = render(TerminalLine, {
    props: { text: "TORCH_PORT=8000 torviello-engine" },
  }).html;
  expect(html).toContain("tv-terminal-line--prompt");
  expect(html).toContain('aria-hidden="true">$</span>');
  expect(html).toContain(">TORCH_PORT=8000 torviello-engine<");
});

test("terminal line renders status lines with the teal bullet", () => {
  const html = render(TerminalLine, {
    props: {
      text: '{"event":"startup","message":"engine started"}',
      kind: "status",
    },
  }).html;
  expect(html).toContain("tv-terminal-line--status");
  expect(html).toContain('aria-hidden="true">•</span>');
  expect(html).toContain(">{\"event\":\"startup\",\"message\":\"engine started\"}<");
});

test("terminal lines are real text nodes, selectable and searchable", () => {
  const html = render(TerminalLine, {
    props: { text: "torviello-engine --help" },
  }).html;
  expect(html).toContain(">torviello-engine --help</span>");
  expect(html).not.toMatch(/<img|<canvas|background-image/);
});
