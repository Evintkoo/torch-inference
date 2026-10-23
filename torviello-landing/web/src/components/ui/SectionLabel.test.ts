// Copyright (c) 2026 Torviello.
// Sheet A4 — ported from the 0020 React suite to the Svelte stack.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import SectionLabel from "./SectionLabel.svelte";

test("section label renders the eyebrow pattern with muted text", () => {
  const html = render(SectionLabel, { props: { label: "For builders" } }).html;
  expect(html).toContain('class="tv-section-label"');
  expect(html).toContain(">For builders</p>");
});

test("section label supports the accent variant and an anchor id", () => {
  const html = render(SectionLabel, {
    props: { label: "AI-native inference engine", accent: true, id: "hero-eyebrow" },
  }).html;
  expect(html).toContain("tv-section-label--accent");
  expect(html).toContain('id="hero-eyebrow"');
});
