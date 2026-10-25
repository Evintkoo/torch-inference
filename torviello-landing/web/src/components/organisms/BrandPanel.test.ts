// Copyright (c) 2026 Torviello.
// Sheet O6 (slice 3, ticket 0038) — the brand identity panel: lockup, logo
// variations, hex-labeled palette, and typography samples from the board.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import BrandPanel from "./BrandPanel.svelte";
import { logoMark } from "../../lib/brand";

test("brand panel is a complementary landmark carrying the primary lockup", () => {
  const html = render(BrandPanel, { props: {} }).html;
  expect(html).toContain('aria-label="Brand identity"');
  expect(html).toContain('class="tv-brand__mark"');
  const mark = html.slice(html.indexOf("tv-brand__mark"));
  const firstPath = logoMark.match(/d="M[0-9.]+ [0-9.]+[^"]+"/)?.[0] ?? "MISSING";
  expect(mark).toContain(firstPath);
  expect(html).toContain(">torviello</span>");
});

test("brand panel renders the three logo variation previews with captions", () => {
  const html = render(BrandPanel, { props: {} }).html;
  expect(html.match(/class="tv-brand__variation /g)).toHaveLength(3);
  expect(html).toContain(">LOGO VARIATIONS</p>");
  expect(html).toContain(">APP ICON</p>");
});

test("brand panel renders the four palette swatches with exact hex values", () => {
  const html = render(BrandPanel, { props: {} }).html;
  expect(html.match(/class="tv-brand__swatch /g)).toHaveLength(4);
  expect(html).toContain(">Midnight</p>");
  expect(html).toContain(">#0B1020</p>");
  expect(html).toContain(">Torviello Orange</p>");
  expect(html).toContain(">#FF683B</p>");
  expect(html).toContain(">Warm White</p>");
  expect(html).toContain(">#F7F8FA</p>");
  expect(html).toContain(">Signal Teal</p>");
  expect(html).toContain(">#22D3C5</p>");
  expect(html).toContain(">COLOR PALETTE</p>");
});

test("brand panel renders the two typography samples", () => {
  const html = render(BrandPanel, { props: {} }).html;
  expect(html.match(/class="tv-brand__type-sample /g)).toHaveLength(2);
  expect(html).toContain(">Inter</p>");
  expect(html).toContain(">Headings &amp; UI</p>");
  expect(html).toContain(">JetBrains Mono</p>");
  expect(html).toContain(">Code &amp; Technical</p>");
});
