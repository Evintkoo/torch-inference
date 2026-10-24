// Copyright (c) 2026 Torviello.
// Sheet O1 + functional design F-02, F-03, F-04.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import HeroSection from "./HeroSection.svelte";

const icon = '<svg viewBox="0 0 24 24"></svg>';
const cards = [
  { icon, title: "DEVELOP", caption: "Experiment, iterate, and optimize." },
  { icon, title: "DEPLOY", caption: "Scale with confidence." },
  { icon, title: "INFER", caption: "Real-world impact." },
];

const base = {
  eyebrow: "AI-native inference engine",
  line1: "Torviello",
  line2: "Built to",
  accent: "infer.",
  body: "An AI-native inference engine for the next generation of builders.",
  primaryLabel: "Get Started",
  primaryHref: "#install",
  ghostLabel: "View on GitHub",
  githubHref: "https://github.com/torviello",
  cards,
};

test("hero renders the promise without interaction", () => {
  const html = render(HeroSection, { props: base }).html;
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">Torviello</span>");
  expect(html).toContain("Built to");
  expect(html).toContain('tv-hero__accent">infer.</em>');
  expect(html).toContain("An AI-native inference engine for the next generation of builders.");
  expect(html).toContain(">AI-native inference engine</p>");
});

test("hero actions navigate to install and repository", () => {
  const html = render(HeroSection, { props: base }).html;
  expect(html).toContain('class="tv-button tv-button--primary"');
  expect(html).toContain('href="#install"');
  expect(html).toContain(">Get Started</a>");
  const ghost = html.slice(html.indexOf("tv-button--ghost") - 200, html.indexOf("View on GitHub</a>") + 18);
  expect(ghost).toContain('href="https://github.com/torviello"');
  expect(ghost).toContain('target="_blank"');
  expect(ghost).toContain('rel="noopener noreferrer"');
});

test("hero actions pair icons with their labels per house rule 10", () => {
  const html = render(HeroSection, { props: base }).html;
  const primary = html.slice(html.indexOf("tv-button--primary"), html.indexOf(">Get Started</a>"));
  expect(primary).toContain('class="tv-icon"');
  expect(primary).toContain('aria-hidden="true"');
  const ghost = html.slice(html.indexOf("tv-button--ghost"), html.indexOf("View on GitHub</a>"));
  expect(ghost).toContain('class="tv-icon"');
  expect(ghost).toContain('aria-hidden="true"');
});

test("hero composes the three glass cards in board order over hidden artwork", () => {
  const html = render(HeroSection, { props: base }).html;
  const develop = html.indexOf(">DEVELOP</p>");
  const deploy = html.indexOf(">DEPLOY</p>");
  const infer = html.indexOf(">INFER</p>");
  expect(develop).toBeGreaterThan(-1);
  expect(deploy).toBeGreaterThan(develop);
  expect(infer).toBeGreaterThan(deploy);
  expect(html).toContain("Experiment, iterate, and optimize.");
  expect(html).toContain("Scale with confidence.");
  expect(html).toContain("Real-world impact.");
  expect(html).toContain('tv-hero__ribbon" aria-hidden="true"');
});

test("hero card icons are decorative inline svg", () => {
  const html = render(HeroSection, { props: base }).html;
  expect(html.match(/<svg/g)?.length).toBeGreaterThanOrEqual(3);
  expect(html).toContain('tv-glass-card__icon" aria-hidden="true"');
});
