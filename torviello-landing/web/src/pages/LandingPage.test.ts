// Copyright (c) 2026 Torviello.
// Landing redesign specification (LP-01…LP-09, AC-LP-1…9, ticket 0041).
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import LandingPage from "./LandingPage.svelte";

const html = render(LandingPage, { props: {} }).html;

test("the nav renders once at the template level in a sticky wrapper (LP-01)", () => {
  expect(html).toContain('class="tv-topnav"');
  expect(html.match(/aria-label="Main"/g)).toHaveLength(1);
  // The hero renders no nested nav (AC-LP-1).
  const hero = html.slice(html.indexOf('class="tv-hero"'), html.indexOf('class="tv-values"'));
  expect(hero).not.toContain('aria-label="Main"');
});

test("the hero promises one line with the accent word and no brand-name line (LP-02)", () => {
  const h1 = html.slice(html.indexOf("<h1"), html.indexOf("</h1>"));
  expect(h1).toContain("Built to");
  expect(h1).toContain('tv-hero__accent">infer.</em>');
  expect(h1).not.toContain("Torviello");
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).toContain(">AI-native inference engine</p>");
});

test("the hero carries the trust line under the actions (LP-02)", () => {
  const hero = html.slice(html.indexOf('class="tv-hero"'), html.indexOf('class="tv-values"'));
  expect(hero).toContain(">MIT licensed · Runs on your machine</p>");
});

test("the hero rail orders develop, deploy, infer in normal flow (LP-02)", () => {
  const rail = html.slice(html.indexOf('class="tv-hero__rail"'), html.indexOf('class="tv-hero__actions"'));
  expect(rail.indexOf(">DEVELOP</p>")).toBeGreaterThan(-1);
  expect(rail.indexOf(">DEVELOP</p>")).toBeLessThan(rail.indexOf(">DEPLOY</p>"));
  expect(rail.indexOf(">DEPLOY</p>")).toBeLessThan(rail.indexOf(">INFER</p>"));
  // The board's absolutely-positioned flow artwork is gone (nothing can clip).
  expect(html).not.toContain('class="tv-flow"');
});

test("the hero shows the documented engine session as the only verified transcript (LP-02)", () => {
  const hero = html.slice(html.indexOf('class="tv-hero"'), html.indexOf('id="product"'));
  expect(hero).toContain("Documented engine session");
  expect(hero).toContain(">torviello-engine --help</span>");
  expect(hero).toContain(">TORCH_PORT=8000 torviello-engine</span>");
  expect(hero).toContain('"event":"startup"');
  // The verified session is not labeled illustrative, and the hero carries
  // no illustrative content at all.
  expect(hero).not.toContain("Illustrative example");
});

test("the value section heads the four value props (LP-03)", () => {
  const values = html.slice(html.indexOf('id="product"'), html.indexOf('class="tv-proof"'));
  expect(values).toContain(">Why Torviello</h2>");
  expect(values.match(/tv-feature-item"/g)).toHaveLength(4);
  expect(values).toContain(">High Performance</h2>");
  expect(values).toContain(">Built for Real Teams</h2>");
});

test("the proof band shows pending slots and claims no numbers (LP-04)", () => {
  const proof = html.slice(html.indexOf('class="tv-proof"'), html.indexOf('id="use-cases"'));
  expect(proof).toContain(">Numbers, not claims.</h2>");
  expect(proof.match(/tv-proof__slot"/g)).toHaveLength(3);
  expect(proof.match(/tv-proof__value" data-pending/g)).toHaveLength(3);
  // Placeholder values are em-dashes, never digits.
  const values = proof.match(/tv-proof__value" data-pending="true">([^<]*)</g) ?? [];
  expect(values).toHaveLength(3);
  for (const value of values) expect(value).toContain(">—<");
  expect(proof.match(/First benchmark pending/g)).toHaveLength(3);
  expect(proof).toContain("No performance number is claimed until the first benchmark run publishes");
});

test("the use-cases row heads exactly three audience cards (LP-05)", () => {
  const showcase = html.slice(html.indexOf('id="use-cases"'), html.indexOf('class="tv-cta"'));
  expect(showcase).toContain(">Torviello for every stage.</h2>");
  expect(showcase.match(/class="tv-audience-card /g)).toHaveLength(3);
});

test("the terminal band pairs explanatory copy with the illustrative example (LP-06)", () => {
  const band = html.slice(html.indexOf('class="tv-terminal-band"'), html.indexOf('class="tv-cta"'));
  expect(band).toContain(">Up and running in minutes.</h2>");
  const copyAt = band.indexOf(">Up and running in minutes.</h2>");
  const terminalAt = band.indexOf("Illustrative example");
  expect(copyAt).toBeLessThan(terminalAt);
  expect(band).toContain(">pip install torviello</span>");
  expect(band).toContain(">torviello serve --model my-model</span>");
  expect(band).toContain(">Read the docs</a>");
});

test("the CTA band closes the page above the footer (LP-07)", () => {
  const cta = html.slice(html.indexOf('class="tv-cta"'), html.indexOf('class="tv-template__footer"'));
  expect(cta).toContain(">Start building today.</h2>");
  expect(cta).toContain('class="tv-button tv-button--inverse" href="https://docs.torviello.dev/install"');
  expect(cta).toContain(">View on GitHub</a>");
});

test("the footer renders brand, product, and community columns (LP-08)", () => {
  const footer = html.slice(html.indexOf('class="tv-footer"'));
  expect(footer).toContain("The execution layer for AI.");
  expect(footer).toContain(">Product</p>");
  expect(footer).toContain(">Community</p>");
  expect(footer).toContain(">Install</a>");
  expect(footer).toContain(">Docs</a>");
  expect(footer).toContain(">GitHub</a>");
  expect(footer).toContain(">Discussions</a>");
  expect(footer).toContain("© 2026 Torviello");
});

test("the section order is nav, hero, values, proof, use cases, terminal, cta, footer (LP-09)", () => {
  const order = [
    html.indexOf('class="tv-topnav"'),
    html.indexOf('class="tv-hero"'),
    html.indexOf('id="product"'),
    html.indexOf('class="tv-proof"'),
    html.indexOf('id="use-cases"'),
    html.indexOf('class="tv-terminal-band"'),
    html.indexOf('class="tv-cta"'),
    html.indexOf('class="tv-template__footer"'),
  ];
  expect(order.every((position) => position > -1)).toBe(true);
  for (let i = 1; i < order.length; i += 1) {
    expect(order[i - 1]).toBeLessThan(order[i]!);
  }
});

test("the page keeps one h1, navigable h2 headings, and no h3 (LP-09)", () => {
  expect(html.match(/<h1/g)).toHaveLength(1);
  for (const heading of [
    ">Why Torviello</h2>",
    ">Numbers, not claims.</h2>",
    ">Torviello for every stage.</h2>",
    ">From idea to impact.</h2>",
    ">Up and running in minutes.</h2>",
    ">Start building today.</h2>",
  ]) {
    expect(html).toContain(heading);
  }
  expect(html).not.toContain("</h3>");
});

test("nav anchors resolve to their sections (LP-01)", () => {
  expect(html).toContain('href="#product"');
  expect(html).toContain('href="#use-cases"');
  expect(html).toContain('href="#community"');
  expect(html).toContain('id="product"');
  expect(html).toContain('id="use-cases"');
  expect(html).toContain('id="community"');
});

test("the hero and cta actions keep their destinations (LP-02, LP-07)", () => {
  expect(html.match(/tv-button--primary"/g)).toHaveLength(2);
  expect(html.match(/tv-button--inverse"/g)).toHaveLength(1);
  expect(html).toContain('class="tv-button tv-button--primary" href="https://docs.torviello.dev/install"');
});

test("the audience actions keep the m4 destinations (carried from BC/0038)", () => {
  expect(html).toContain(">Start building</a>");
  expect(html).toContain(">Read the docs</a>");
  expect(html).toContain(">See it on GitHub</a>");
  const githubLinks = html.match(/href="https:\/\/github\.com\/torviello"/g) ?? [];
  expect(githubLinks.length).toBeGreaterThanOrEqual(4);
});

test("every rendered action pairs an icon with its label per house rule 10", () => {
  const actions = html.match(/<a class="tv-button[^>]*>.*?<\/a>/gs) ?? [];
  expect(actions.length).toBeGreaterThanOrEqual(8);
  for (const action of actions) {
    expect(action).toContain('class="tv-icon"');
    expect(action).toContain('aria-hidden="true"');
  }
});

test("the page offers a skip link to the main landmark (LP-09)", () => {
  expect(html).toContain('class="tv-skip-link" href="#main"');
  expect(html).toContain('<main class="tv-template__main" id="main">');
});

test("the page wires the three media-unit photos to the showcase cards (carried)", () => {
  const photos = html.match(/<img class="tv-audience-card__photo"[^>]*>/g) ?? [];
  expect(photos).toHaveLength(3);
  expect(photos[0]).toMatch(/builders\.jpg/);
  expect(photos[1]).toMatch(/teams\.jpg/);
  expect(photos[2]).toMatch(/city\.jpg/);
  for (const photo of photos) {
    expect(photo).toContain('alt=""');
    expect(photo).toContain('aria-hidden="true"');
    expect(photo).toContain('loading="lazy"');
  }
});

test("the design-standard brand sheet stays off the site (BC-04, carried)", () => {
  expect(html).not.toContain('aria-label="Brand identity"');
  expect(html).not.toContain(">LOGO VARIATIONS</p>");
  expect(html).not.toContain(">COLOR PALETTE</p>");
});
