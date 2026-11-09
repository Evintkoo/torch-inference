// Copyright (c) 2026 Torviello.
// Landing redesign (ticket 0041, second amendment): the centered hero —
// badge chip, display promise, inline rail, actions, trust line, and the
// decorative inference artwork as the visual anchor. The engine session
// moved out of the hero to its own band (LP-02, LP-10).
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import HeroPanel from "./HeroPanel.svelte";

const base = {
  eyebrow: "AI-native inference engine",
  promiseLine: "Built to",
  accent: "infer.",
  body: "An AI-native inference engine for the next generation of builders.",
  primaryLabel: "Get Started",
  primaryHref: "https://github.com/Evintkoo/torch-inference/blob/main/torviello-docs/docs/INSTALL.md",
  ghostLabel: "View on GitHub",
  githubHref: "https://github.com/torviello",
  stages: [
    { icon: "box", title: "DEVELOP", caption: "Experiment, iterate, and optimize." },
    { icon: "package", title: "DEPLOY", caption: "Scale with confidence." },
    { icon: "zap", title: "INFER", caption: "Real-world impact." },
  ],
};

test("the hero renders the badge chip above one display promise h1", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html.match(/<h1/g)).toHaveLength(1);
  const badgeAt = html.indexOf('class="tv-hero__badge"');
  const h1At = html.indexOf("<h1");
  expect(badgeAt).toBeGreaterThan(-1);
  expect(badgeAt).toBeLessThan(h1At);
  expect(html).toContain(">Built to");
  expect(html).toContain('tv-hero__accent">infer.</em>');
  expect(html).toContain(">AI-native inference engine</p>");
});

test("the hero composes centered: copy, rail, actions, trust in one column", () => {
  const html = render(HeroPanel, { props: base }).html;
  const order = [
    html.indexOf('class="tv-hero__badge"'),
    html.indexOf("<h1"),
    html.indexOf('class="tv-hero__body-copy"'),
    html.indexOf('class="tv-hero__rail"'),
    html.indexOf('class="tv-hero__actions"'),
    html.indexOf('class="tv-hero__trust"'),
  ];
  expect(order.every((position) => position > -1)).toBe(true);
  for (let i = 1; i < order.length; i += 1) {
    expect(order[i - 1]).toBeLessThan(order[i]!);
  }
  expect(html).toContain(">MIT licensed · Runs on your machine</p>");
});

test("the hero visual is the decorative artwork, not the engine session", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).toContain('<svg class="tv-artwork"');
  expect(html.match(/<svg class="tv-artwork"/g)).toHaveLength(1);
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain("Documented engine session");
  expect(html).not.toContain("torviello-engine --help");
  expect(html).not.toContain("Illustrative example");
});

test("the hero rail lists the three stages with glyph chips and connectors", () => {
  const html = render(HeroPanel, { props: base }).html;
  const rail = html.slice(html.indexOf('class="tv-hero__rail"'), html.indexOf('class="tv-hero__actions"'));
  expect(rail.indexOf(">DEVELOP</p>")).toBeLessThan(rail.indexOf(">DEPLOY</p>"));
  expect(rail.indexOf(">DEPLOY</p>")).toBeLessThan(rail.indexOf(">INFER</p>"));
  expect(rail.match(/tv-hero__stage-icon/g)).toHaveLength(3);
  expect(rail.match(/tv-hero__rail-connector/g)).toHaveLength(2);
});

test("the hero keeps both actions with safe externals and no navigation", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).toContain(
    'class="tv-button tv-button--primary" href="https://github.com/Evintkoo/torch-inference/blob/main/torviello-docs/docs/INSTALL.md"',
  );
  const ghost = html.slice(html.indexOf("tv-button--ghost"), html.indexOf(">View on GitHub</a>"));
  expect(ghost).toContain('target="_blank"');
  expect(ghost).toContain('rel="noopener noreferrer"');
  expect(html).not.toContain('aria-label="Main"');
  expect(html).not.toContain('class="tv-flow"');
});
