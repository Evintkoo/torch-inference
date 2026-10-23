// Copyright (c) 2026 Torviello.
// Sheet M3 + functional design F-05.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import FeatureItem from "./FeatureItem.svelte";

test("feature item reads title then subcopy", () => {
  const html = render(FeatureItem, {
    props: { icon: "⚡", title: "High Performance", subcopy: "Optimized for speed" },
  }).html;
  const titleAt = html.indexOf(">High Performance</");
  const subcopyAt = html.indexOf(">Optimized for speed</");
  expect(titleAt).toBeGreaterThan(-1);
  expect(subcopyAt).toBeGreaterThan(titleAt);
  expect(html).toContain("tv-feature-item");
});

test("feature item hides the icon from assistive tech", () => {
  const html = render(FeatureItem, {
    props: { icon: "⚡", title: "High Performance", subcopy: "Optimized for speed" },
  }).html;
  expect(html).toContain('tv-feature-item__icon" aria-hidden="true"');
});
