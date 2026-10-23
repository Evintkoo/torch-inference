// Copyright (c) 2026 Torviello.
// Sheet M2 + functional design F-04.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import GlassCard from "./GlassCard.svelte";

test("glass card reads icon then title then caption in DOM order", () => {
  const html = render(GlassCard, {
    props: { icon: "⌘", title: "Develop", caption: "Build models fast" },
  }).html;
  const iconAt = html.indexOf("tv-glass-card__icon");
  const titleAt = html.indexOf(">Develop</");
  const captionAt = html.indexOf(">Build models fast</");
  expect(iconAt).toBeGreaterThan(-1);
  expect(titleAt).toBeGreaterThan(iconAt);
  expect(captionAt).toBeGreaterThan(titleAt);
  expect(html).toContain("tv-glass-card");
});

test("glass card hides the icon and the glow layer from assistive tech", () => {
  const html = render(GlassCard, {
    props: { icon: "⌘", title: "Develop", caption: "Build models fast" },
  }).html;
  expect(html).toContain('tv-glass-card__icon" aria-hidden="true"');
  expect(html).toContain('tv-glass-card__glow" aria-hidden="true"');
});

test("glass card is purely decorative with no interactive elements", () => {
  const html = render(GlassCard, {
    props: { icon: "⌘", title: "Deploy", caption: "Ship anywhere" },
  }).html;
  expect(html).not.toMatch(/<button|<a |tabindex|onclick/i);
});
