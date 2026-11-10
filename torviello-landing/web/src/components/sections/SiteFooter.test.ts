// Copyright (c) 2026 Torviello.
// Landing redesign (LP-08, ticket 0041 second amendment): the footer — brand
// block, Product / Resources / Community columns, oversized decorative
// wordmark, and the legal bar. Every link resolves to a designated host.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import SiteFooter from "./SiteFooter.svelte";

test("the footer renders the brand block and all three link columns", () => {
  const html = render(SiteFooter, { props: { id: "community" } }).html;
  expect(html).toContain('id="community"');
  expect(html).toContain('href="#top" aria-label="Torviello home"');
  expect(html).toContain("The execution layer for AI.");
  expect(html).toContain('aria-label="Footer"');
  expect(html).toContain(">Product</p>");
  expect(html).toContain(">Resources</p>");
  expect(html).toContain(">Community</p>");
});

test("the columns link install, docs, reference, github, issues, contributing", () => {
  const html = render(SiteFooter, { props: {} }).html;
  expect(html).toContain(">Install</a>");
  expect(html).toContain(">Docs</a>");
  expect(html).toContain(">Documentation</a>");
  expect(html).toContain(">API Reference</a>");
  expect(html).toContain(">GitHub</a>");
  // LP-11: Discussions is disabled on the repository — Issues replaces it.
  expect(html).not.toContain(">Discussions</a>");
  expect(html).toContain(">Issues</a>");
  expect(html).not.toContain("/discussions");
  expect(html).toContain(">Contributing</a>");
  const links = html.match(/<a class="tv-footer__link"[^>]*>[\s\S]*?<\/a>/g) ?? [];
  expect(links.length).toBe(7);
  for (const link of links) {
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noopener noreferrer"');
    expect(link).toMatch(/https:\/\/github\.com\/Evintkoo\/torch-inference/);
  }
});

test("API Reference resolves to the published OpenAPI contract (LP-11)", () => {
  const html = render(SiteFooter, { props: {} }).html;
  const link = html.match(/<a class="tv-footer__link"[^>]*>API Reference<\/a>/)?.[0] ?? "";
  expect(link).toContain(
    'href="https://github.com/Evintkoo/torch-inference/blob/main/torviello-engine/contracts/openapi.yaml"',
  );
});

test("an oversized decorative wordmark sits above the legal bar", () => {
  const html = render(SiteFooter, { props: {} }).html;
  const mega = html.indexOf('class="tv-container tv-footer__mega" aria-hidden="true"');
  const legal = html.indexOf("tv-footer__bottom");
  expect(mega).toBeGreaterThan(-1);
  expect(legal).toBeGreaterThan(mega);
  expect(html).toContain("© 2026 Torviello");
  expect(html).toContain("MIT licensed");
});
