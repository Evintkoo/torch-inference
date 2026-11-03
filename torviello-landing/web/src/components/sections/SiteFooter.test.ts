// Copyright (c) 2026 Torviello.
// Landing redesign (LP-08, AC-LP-7, ticket 0041) — the structured footer:
// brand column, Product and Community link columns, and the copyright bar.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import SiteFooter from "./SiteFooter.svelte";

test("the footer renders the brand column and both link columns", () => {
  const html = render(SiteFooter, { props: { id: "community" } }).html;
  expect(html).toContain('id="community"');
  expect(html).toContain(">torviello</a>");
  expect(html).toContain("The execution layer for AI.");
  expect(html).toContain('aria-label="Footer"');
  expect(html).toContain(">Product</p>");
  expect(html).toContain(">Community</p>");
});

test("the product column links install and docs on the docs host", () => {
  const html = render(SiteFooter, { props: {} }).html;
  expect(html).toContain('>Install</a>');
  expect(html).toContain('href="https://docs.torviello.dev/install"');
  expect(html).toContain(">Docs</a>");
  expect(html).toContain('href="https://docs.torviello.dev"');
});

test("the community column links github and discussions with safe externals", () => {
  const html = render(SiteFooter, { props: {} }).html;
  expect(html).toContain(">GitHub</a>");
  expect(html).toContain(">Discussions</a>");
  const links = html.match(/<a class="tv-footer__link"[^>]*>[\s\S]*?<\/a>/g) ?? [];
  expect(links.length).toBe(4);
  for (const link of links) {
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noopener noreferrer"');
  }
});

test("the copyright bar closes the footer and the brand returns to the top", () => {
  const html = render(SiteFooter, { props: {} }).html;
  expect(html).toContain("© 2026 Torviello");
  expect(html).toContain('href="#top" aria-label="Torviello home"');
});
