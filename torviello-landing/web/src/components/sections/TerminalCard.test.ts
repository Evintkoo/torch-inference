// Copyright (c) 2026 Torviello.
// Sheet M8 (slice 3, ticket 0038) — the terminal execution showcase card. The
// pip/serve example is design material: a visible mono label marks it
// illustrative so no command reads as verified engine behavior (BC-06, F-07
// amendment).
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import TerminalCard from "./TerminalCard.svelte";

const commands = ["pip install torviello", "torviello serve --model my-model"];
const steps = [
  "Loading model...",
  "Optimizing graph...",
  "Starting inference server...",
  "Ready.",
];

test("terminal card renders the window chrome and both prompt lines as text", () => {
  const html = render(TerminalCard, { props: { commands, steps } }).html;
  expect(html.match(/class="tv-terminal-card__dot"/g)?.length).toBe(3);
  expect(html).toContain(">$</span>");
  expect(html).toContain(">pip install torviello</span>");
  expect(html).toContain(">torviello serve --model my-model</span>");
});

test("terminal card renders the four-step status rail with markers and connector", () => {
  const html = render(TerminalCard, { props: { commands, steps } }).html;
  expect(html.match(/tv-terminal-card__step"/g)).toHaveLength(4);
  expect(html.match(/tv-terminal-card__marker/g)?.length).toBe(4);
  expect(html).toContain(">Loading model...</span>");
  expect(html).toContain(">Ready.</span>");
  expect(html).toContain("tv-terminal-card__rail");
});

test("terminal card labels the example as illustrative before the commands", () => {
  const html = render(TerminalCard, { props: { commands, steps } }).html;
  const label = html.indexOf("Illustrative example");
  expect(label).toBeGreaterThan(-1);
  expect(label).toBeLessThan(html.indexOf(">pip install torviello</span>"));
});

test("terminal card transcript stays real selectable text, not an image", () => {
  const html = render(TerminalCard, { props: { commands, steps } }).html;
  expect(html).toContain("<pre");
  expect(html).not.toContain("<img");
});
