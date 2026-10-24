// Copyright (c) 2026 Torviello.
// Sheet P1 + functional design acceptance mapping F-01..F-08.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import LandingPage from "./LandingPage.svelte";

const html = render(LandingPage, { props: {} }).html;

test("page renders the nav with resolvable section anchors", () => {
  expect(html).toContain('aria-label="Main"');
  expect(html).toContain('href="#product"');
  expect(html).toContain('href="#use-cases"');
  expect(html).toContain('id="product"');
  expect(html).toContain('id="use-cases"');
  expect(html).toContain('id="community"');
});

test("page renders the hero promise exactly once", () => {
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">Torviello</span>");
  expect(html).toContain('tv-hero__accent">infer.</em>');
  expect(html).toContain(">AI-native inference engine</p>");
});

test("page renders the full board composition in order", () => {
  expect(html.match(/tv-feature-item"/g)).toHaveLength(4);
  expect(html.match(/tv-audience-card"/g)).toHaveLength(3);
  expect(html).toContain(">torviello-engine --help</span>");
  expect(html).toContain('message":"engine started"}</span>');
  expect(html).toContain("The execution layer for AI.");
});

test("page keeps one h1 and navigable h2 section headings", () => {
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">High Performance</h2>");
  expect(html).toContain(">From idea to impact.</h2>");
  expect(html).not.toContain("</h3>");
});

test("page offers a skip link to the main landmark", () => {
  expect(html).toContain('class="tv-skip-link" href="#main"');
  expect(html).toContain('<main class="tv-template__main" id="main">');
});

test("page primary actions navigate to the docs install page", () => {
  expect(html.match(/tv-button--primary"/g)?.length).toBe(2);
  expect(html.match(/tv-button--primary" href="https:\/\/docs\.torviello\.dev\/install"/g)?.length).toBe(2);
});

test("page wires the slice-two audience actions to the M4 destinations", () => {
  expect(html.match(/href="https:\/\/docs\.torviello\.dev\/install"/g)?.length).toBe(3);
  expect(html.match(/href="https:\/\/docs\.torviello\.dev"/g)?.length).toBe(3);
  expect(html.match(/href="https:\/\/github\.com\/torviello"/g)?.length).toBe(4);
  expect(html).toContain(">Start building →</a>");
  expect(html).toContain(">Read the docs →</a>");
  expect(html).toContain(">See it on GitHub →</a>");
});

test("every rendered action pairs an icon with its label per house rule 10", () => {
  expect(html.match(/class="tv-icon"/g)).toHaveLength(7);
});

test("page keeps the board composition order", () => {
  const order =
    html.indexOf(">Torviello</span>") <
      html.indexOf(">High Performance</h2>") &&
    html.indexOf(">High Performance</h2>") < html.indexOf(">From idea to impact.</h2>") &&
    html.indexOf(">From idea to impact.</h2>") < html.indexOf(">torviello-engine --help</span>") &&
    html.indexOf(">torviello-engine --help</span>") < html.indexOf("The execution layer for AI.");
  expect(order).toBe(true);
});
