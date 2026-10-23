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
  expect(html).toContain(">pip install torviello</span>");
  expect(html).toContain(">Ready 🚀</span>");
  expect(html).toContain("The execution layer for AI.");
});

test("page primary actions navigate to the docs install page", () => {
  expect(html.match(/tv-button--primary/g)?.length).toBe(2);
  expect(html.match(/href="https:\/\/docs\.torviello\.dev\/install"/g)?.length).toBe(2);
});

test("page keeps the board composition order", () => {
  const order =
    html.indexOf(">Torviello</span>") <
      html.indexOf(">High Performance</h3>") &&
    html.indexOf(">High Performance</h3>") < html.indexOf(">From idea to impact.</h3>") &&
    html.indexOf(">From idea to impact.</h3>") < html.indexOf(">pip install torviello</span>") &&
    html.indexOf(">pip install torviello</span>") < html.indexOf("The execution layer for AI.");
  expect(order).toBe(true);
});
