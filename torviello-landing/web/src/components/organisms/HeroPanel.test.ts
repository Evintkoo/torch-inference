// Copyright (c) 2026 Torviello.
// Sheet O4 (slice 3, ticket 0038) — the hero panel composes the in-panel
// navigation, the hero promise, the flow artwork, and the feature strip.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import HeroPanel from "./HeroPanel.svelte";

const icon = '<svg viewBox="0 0 24 24"></svg>';
const base = {
  links: [
    { label: "Product", href: "#product" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Docs", href: "https://docs.torviello.dev", external: true },
    { label: "Community", href: "#community" },
  ],
  getStartedHref: "https://docs.torviello.dev/install",
  githubHref: "https://github.com/torviello",
  eyebrow: "AI-native inference engine",
  line1: "Torviello",
  line2: "Built to",
  accent: "infer.",
  body: "An AI-native inference engine for the next generation of builders.",
  primaryLabel: "Get Started",
  ghostLabel: "View on GitHub",
  strip: [
    { icon, title: "High Performance", subcopy: "Optimized for real workloads" },
    { icon, title: "Flexible Deployment", subcopy: "Cloud, on-prem, or edge" },
    { icon, title: "Developer & AI Native Friendly", subcopy: "Simple APIs, powerful control" },
    { icon, title: "Built for Real Teams", subcopy: "From research to production" },
  ],
};

test("hero panel carries the navigation with links and paired actions", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).toContain('aria-label="Main"');
  expect(html).toContain('href="#product"');
  expect(html).toContain('href="#use-cases"');
  expect(html).toContain('href="#community"');
  expect(html).toContain('class="tv-button tv-button--primary" href="https://docs.torviello.dev/install"');
  const ghost = html.slice(html.indexOf("tv-button--ghost"), html.indexOf(">GitHub</a>"));
  expect(ghost).toContain('target="_blank"');
  expect(ghost).toContain('rel="noopener noreferrer"');
});

test("hero panel renders one h1 with the orange-emphasized word", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">Torviello</span>");
  expect(html).toContain('tv-hero__accent">infer.</em>');
  expect(html).toContain(">AI-native inference engine</p>");
});

test("hero panel includes the flow artwork and the four-item strip", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).toContain('class="tv-flow" aria-hidden="true"');
  expect(html.match(/tv-feature-item"/g)).toHaveLength(4);
  expect(html).toContain(">High Performance</h2>");
  expect(html).toContain(">Built for Real Teams</h2>");
});

test("hero panel is the product section with the flow below the copy in dom order", () => {
  const html = render(HeroPanel, { props: base }).html;
  const nav = html.indexOf('aria-label="Main"');
  const heading = html.indexOf("<h1");
  const flow = html.indexOf('class="tv-flow"');
  const strip = html.indexOf("tv-feature-grid");
  expect(nav).toBeGreaterThan(-1);
  expect(heading).toBeGreaterThan(nav);
  expect(flow).toBeGreaterThan(heading);
  expect(strip).toBeGreaterThan(flow);
});
