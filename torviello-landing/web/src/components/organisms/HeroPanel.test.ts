// Copyright (c) 2026 Torviello.
// Landing redesign (LP-02, AC-LP-2, ticket 0041) — the unboxed hero: one
// promise h1, trust line, inline rail, and the documented engine session.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import HeroPanel from "./HeroPanel.svelte";

const base = {
  eyebrow: "AI-native inference engine",
  promiseLine: "Built to",
  accent: "infer.",
  body: "An AI-native inference engine for the next generation of builders.",
  primaryLabel: "Get Started",
  primaryHref: "https://docs.torviello.dev/install",
  ghostLabel: "View on GitHub",
  githubHref: "https://github.com/torviello",
  stages: [
    { icon: "box", title: "DEVELOP", caption: "Experiment, iterate, and optimize." },
    { icon: "package", title: "DEPLOY", caption: "Scale with confidence." },
    { icon: "zap", title: "INFER", caption: "Real-world impact." },
  ],
  session: {
    commands: ["torviello-engine --help", "TORCH_PORT=8000 torviello-engine"],
    output: '{"event":"startup","version":"1.0.0","correlation_id":"…","message":"engine started"}',
  },
};

test("the hero renders one promise h1 with the accent word", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">Built to");
  expect(html).toContain('tv-hero__accent">infer.</em>');
});

test("the hero keeps the approved eyebrow and body copy", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).toContain(">AI-native inference engine</p>");
  expect(html).toContain("An AI-native inference engine for the next generation of builders.");
});

test("the hero actions pair icons, keep destinations, and are safe externally", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).toContain(
    'class="tv-button tv-button--primary" href="https://docs.torviello.dev/install"',
  );
  const ghost = html.slice(html.indexOf("tv-button--ghost"), html.indexOf(">View on GitHub</a>"));
  expect(ghost).toContain('target="_blank"');
  expect(ghost).toContain('rel="noopener noreferrer"');
  expect(html).toContain(">MIT licensed · Runs on your machine</p>");
});

test("the hero rail lists the three stages in order between copy and actions", () => {
  const html = render(HeroPanel, { props: base }).html;
  const rail = html.slice(html.indexOf('class="tv-hero__rail"'), html.indexOf('class="tv-hero__actions"'));
  expect(rail.indexOf(">DEVELOP</p>")).toBeLessThan(rail.indexOf(">DEPLOY</p>"));
  expect(rail.indexOf(">DEPLOY</p>")).toBeLessThan(rail.indexOf(">INFER</p>"));
  const railAt = html.indexOf('class="tv-hero__rail"');
  const actionsAt = html.indexOf('class="tv-hero__actions"');
  expect(railAt).toBeLessThan(actionsAt);
});

test("the hero renders the documented engine session, not an illustrative one", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).toContain("Documented engine session");
  expect(html).toContain(">torviello-engine --help</span>");
  expect(html).toContain(">TORCH_PORT=8000 torviello-engine</span>");
  expect(html).toContain('"event":"startup"');
  expect(html).not.toContain("Illustrative example");
  // The board flow artwork is retired; the rail cannot clip.
  expect(html).not.toContain('class="tv-flow"');
});

test("the hero renders no navigation", () => {
  const html = render(HeroPanel, { props: base }).html;
  expect(html).not.toContain('aria-label="Main"');
});
