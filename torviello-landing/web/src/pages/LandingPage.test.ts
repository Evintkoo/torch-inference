// Copyright (c) 2026 Torviello.
// Sheet P1 (slice 3) + the board composition specification (BC-01…BC-07,
// AC-BC-1…7, ticket 0038).
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import LandingPage from "./LandingPage.svelte";

const html = render(LandingPage, { props: {} }).html;

test("page renders the panel canvas with the two-column upper grid", () => {
  expect(html).toContain('class="tv-canvas"');
  expect(html).toContain('class="tv-main-grid"');
  expect(html).toContain('class="tv-hero-panel"');
  expect(html).toContain('aria-label="Brand identity"');
});

test("page renders the nav with resolvable section anchors", () => {
  expect(html).toContain('aria-label="Main"');
  expect(html).toContain('href="#product"');
  expect(html).toContain('href="#use-cases"');
  expect(html).toContain('id="product"');
  expect(html).toContain('id="use-cases"');
  expect(html).toContain('id="community"');
});

test("page renders the hero promise exactly once inside the hero panel", () => {
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">Torviello</span>");
  expect(html).toContain('tv-hero__accent">infer.</em>');
  expect(html).toContain(">AI-native inference engine</p>");
});

test("page renders the flow stages and the strip inside the hero panel", () => {
  const panel = html.slice(html.indexOf("tv-hero-panel"), html.indexOf("tv-brand-panel"));
  expect(panel).toContain('class="tv-flow" aria-hidden="true"');
  expect(panel.match(/tv-feature-item"/g)).toHaveLength(4);
  expect(panel.indexOf(">DEVELOP</p>")).toBeLessThan(panel.indexOf(">DEPLOY</p>"));
  expect(panel.indexOf(">DEPLOY</p>")).toBeLessThan(panel.indexOf(">INFER</p>"));
});

test("page renders the brand panel content", () => {
  const brand = html.slice(html.indexOf("tv-brand-panel"));
  expect(brand).toContain(">LOGO VARIATIONS</p>");
  expect(brand).toContain(">APP ICON</p>");
  expect(brand).toContain(">#FF683B</p>");
  expect(brand).toContain(">COLOR PALETTE</p>");
  expect(brand).toContain(">JetBrains Mono</p>");
});

test("page renders the four showcase cards in board order", () => {
  expect(html.match(/class="tv-audience-card /g)).toHaveLength(3);
  expect(html.match(/tv-showcase-card--terminal/g)).toHaveLength(1);
  const order = [
    html.indexOf(">From idea to impact.</h2>"),
    html.indexOf(">Build, deploy, scale together.</h2>"),
    html.indexOf(">Models in motion.</h2>"),
    html.indexOf("tv-showcase-card--terminal"),
  ];
  expect(order.every((position) => position > -1)).toBe(true);
  expect(order[0]).toBeLessThan(order[1]!);
  expect(order[1]).toBeLessThan(order[2]!);
  expect(order[2]).toBeLessThan(order[3]!);
});

test("page labels the terminal showcase example as illustrative", () => {
  const terminal = html.slice(html.indexOf("tv-showcase-card--terminal"));
  expect(terminal).toContain("Illustrative example");
  expect(terminal).toContain(">pip install torviello</span>");
  expect(terminal).toContain(">torviello serve --model my-model</span>");
});

test("page offers a skip link to the main landmark", () => {
  expect(html).toContain('class="tv-skip-link" href="#main"');
  expect(html).toContain('<main class="tv-template__main" id="main">');
});

test("page primary actions navigate to the docs install page", () => {
  expect(html.match(/tv-button--primary"/g)?.length).toBe(2);
  expect(html.match(/tv-button--primary" href="https:\/\/docs\.torviello\.dev\/install"/g)?.length).toBe(2);
});

test("page wires the audience actions to the M4 destinations", () => {
  expect(html.match(/href="https:\/\/docs\.torviello\.dev\/install"/g)?.length).toBe(3);
  expect(html.match(/href="https:\/\/docs\.torviello\.dev"/g)?.length).toBe(3);
  expect(html.match(/href="https:\/\/github\.com\/torviello"/g)?.length).toBe(4);
  expect(html).toContain(">Start building</a>");
  expect(html).toContain(">Read the docs</a>");
  expect(html).toContain(">See it on GitHub</a>");
});

test("every rendered action pairs an icon with its label per house rule 10", () => {
  const actions = html.match(/<a class="tv-button[^>]*>.*?<\/a>/gs) ?? [];
  expect(actions.length).toBeGreaterThan(0);
  for (const action of actions) {
    expect(action).toContain('class="tv-icon"');
    expect(action).toContain('aria-hidden="true"');
  }
});

test("page keeps one h1 and navigable h2 section headings", () => {
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">High Performance</h2>");
  expect(html).toContain(">From idea to impact.</h2>");
  expect(html).not.toContain("</h3>");
});

test("page renders the footer with the community anchor", () => {
  expect(html).toContain("The execution layer for AI.");
});

test("page wires the three media-unit photos to the showcase cards", () => {
  // Ticket 0039: the photography imports resolve through the @torviello/media
  // alias and render as the decorative card backgrounds in board order.
  const photos = html.match(/<img class="tv-audience-card__photo"[^>]*>/g) ?? [];
  expect(photos).toHaveLength(3);
  expect(photos[0]).toMatch(/builders\.jpg/);
  expect(photos[1]).toMatch(/teams\.jpg/);
  expect(photos[2]).toMatch(/city\.jpg/);
});

test("every showcase photo is a decorative aria-hidden background", () => {
  const photos = html.match(/<img class="tv-audience-card__photo"[^>]*>/g) ?? [];
  expect(photos).toHaveLength(3);
  for (const photo of photos) {
    expect(photo).toContain('alt=""');
    expect(photo).toContain('aria-hidden="true"');
    expect(photo).toContain('loading="lazy"');
  }
});

test("photos replace the built-in city illustration on the page", () => {
  expect(html).not.toContain("tv-audience-card__city");
});
