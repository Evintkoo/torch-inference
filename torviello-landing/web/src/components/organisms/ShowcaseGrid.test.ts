// Copyright (c) 2026 Torviello.
// Sheet O7 (slice 3, ticket 0038) — the showcase grid: three audience cards
// plus the terminal execution card in one equal-height row.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import ShowcaseGrid from "./ShowcaseGrid.svelte";

const cards = [
  {
    eyebrow: "For builders",
    heading: "From idea to impact.",
    body: "The inference engine that moves with you — from notebooks to production.",
    action: { label: "Start building", href: "https://docs.torviello.dev/install" },
  },
  {
    eyebrow: "For AI teams",
    heading: "Build, deploy, scale together.",
    body: "A unified inference engine for researchers, engineers, and product teams.",
    action: { label: "Read the docs", href: "https://docs.torviello.dev", external: true },
  },
  {
    eyebrow: "For real-world AI",
    heading: "Models in motion.",
    body: "Efficient, adaptable, and ready for production use cases.",
    action: { label: "See it on GitHub", href: "https://github.com/torviello", external: true },
  },
];

const terminal = {
  commands: ["pip install torviello", "torviello serve --model my-model"],
  steps: ["Loading model...", "Optimizing graph...", "Starting inference server...", "Ready."],
};

test("showcase grid renders four equal cards with the terminal card last", () => {
  const html = render(ShowcaseGrid, { props: { cards, terminal } }).html;
  expect(html.match(/class="tv-audience-card /g)).toHaveLength(3);
  expect(html).toContain('class="tv-showcase-card tv-showcase-card--terminal"');
  const github = html.indexOf(">Models in motion.</h2>");
  const terminalCard = html.indexOf("tv-showcase-card--terminal");
  expect(terminalCard).toBeGreaterThan(github);
});

test("showcase grid keeps one action per audience card with safe externals", () => {
  const html = render(ShowcaseGrid, { props: { cards, terminal } }).html;
  expect(html).toContain(">Start building</a>");
  expect(html).toContain(">Read the docs</a>");
  expect(html).toContain(">See it on GitHub</a>");
  expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(2);
});

test("showcase grid renders the three board eyebrows in order", () => {
  const html = render(ShowcaseGrid, { props: { cards, terminal } }).html;
  const at = (heading: string) => html.indexOf(`>${heading}</h2>`);
  expect(at("From idea to impact.")).toBeGreaterThan(-1);
  expect(at("Build, deploy, scale together.")).toBeGreaterThan(at("From idea to impact."));
  expect(at("Models in motion.")).toBeGreaterThan(at("Build, deploy, scale together."));
  expect(html).toContain(">For builders</p>");
  expect(html).toContain(">For AI teams</p>");
  expect(html).toContain(">For real-world AI</p>");
});
