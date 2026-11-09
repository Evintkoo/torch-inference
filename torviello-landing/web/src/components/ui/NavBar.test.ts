// Copyright (c) 2026 Torviello.
// Sheet M1 + functional design F-01, F-03, F-08.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import NavBar from "./NavBar.svelte";

const links = [
  { label: "Product", href: "#product" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Docs", href: "https://github.com/Evintkoo/torch-inference/tree/main/torviello-docs", external: true },
  { label: "Community", href: "#community" },
];

const base = {
  links,
  getStartedHref: "#install",
  githubHref: "https://github.com/torviello",
};

test("navbar emits the nav landmark with the links in fixed order", () => {
  const html = render(NavBar, { props: base }).html;
  expect(html).toContain('aria-label="Main"');
  const order =
    html.indexOf(">Product</a>") > -1 &&
    html.indexOf(">Product</a>") < html.indexOf(">Use Cases</a>") &&
    html.indexOf(">Use Cases</a>") < html.indexOf(">Docs</a>") &&
    html.indexOf(">Docs</a>") < html.indexOf(">Community</a>");
  expect(order).toBe(true);
});

test("navbar marks a current section with aria-current", () => {
  const html = render(NavBar, {
    props: { ...base, currentHref: "#use-cases" },
  }).html;
  const useCases = html.slice(html.indexOf("#use-cases") - 200, html.indexOf("#use-cases") + 200);
  expect(useCases).toContain('aria-current="true"');
});

test("navbar docs link opens the documentation site safely in a new tab", () => {
  const html = render(NavBar, { props: base }).html;
  const docs = html.slice(
    Math.max(0, html.indexOf("https://github.com/Evintkoo/torch-inference/tree/main/torviello-docs") - 200),
    html.indexOf("https://github.com/Evintkoo/torch-inference/tree/main/torviello-docs") + 140
  );
  expect(docs).toContain('target="_blank"');
  expect(docs).toContain('rel="noopener noreferrer"');
});

test("navbar pairs the GitHub ghost action with the Get Started primary action", () => {
  const html = render(NavBar, { props: base }).html;
  expect(html).toContain('class="tv-button tv-button--ghost"');
  const github = html.slice(html.indexOf("tv-button--ghost") - 200, html.indexOf("GitHub</a>") + 11);
  expect(github).toContain('href="https://github.com/torviello"');
  expect(github).toContain('target="_blank"');
  expect(github).toContain('rel="noopener noreferrer"');
  expect(html).toContain('class="tv-button tv-button--primary"');
  expect(html).toContain(">Get Started</a>");
  expect(html.match(/tv-button--primary/g)).toHaveLength(1);
});

test("navbar actions pair icons with their labels per house rule 10", () => {
  const html = render(NavBar, { props: base }).html;
  const github = html.slice(html.indexOf("tv-button--ghost"), html.indexOf("GitHub</a>"));
  expect(github).toContain('class="tv-icon"');
  expect(github).toContain('aria-hidden="true"');
  const started = html.slice(html.indexOf("tv-button--primary"), html.indexOf(">Get Started</a>"));
  expect(started).toContain('class="tv-icon"');
  expect(started).toContain('aria-hidden="true"');
});

test("navbar renders the menu button closed by default with aria-expanded", () => {
  const html = render(NavBar, { props: base }).html;
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('aria-controls="tv-navbar-links"');
  expect(html).toContain('data-menu="closed"');
});

test("navbar menu button opens the link list state", () => {
  const html = render(NavBar, { props: { ...base, defaultMenuOpen: true } }).html;
  expect(html).toContain('aria-expanded="true"');
  expect(html).toContain('data-menu="open"');
});

test("navbar brand renders the A5 logo lockup as the home link", () => {
  const html = render(NavBar, { props: base }).html;
  expect(html).toContain('href="#top" aria-label="Torviello home"');
  expect(html).toContain('class="tv-logo__mark"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain(">torviello</span>");
});
