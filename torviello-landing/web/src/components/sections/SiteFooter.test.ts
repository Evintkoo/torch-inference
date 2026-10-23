// Copyright (c) 2026 Torviello.
// Footer slot of template T1; content kept minimal (sheets define the slot,
// not the copy) with the unit brand line and safe external links.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import SiteFooter from "./SiteFooter.svelte";

test("footer carries the brand line copyright and safe links", () => {
  const html = render(SiteFooter, { props: { id: "community" } }).html;
  expect(html).toContain('id="community"');
  expect(html).toContain(">torviello</a>");
  expect(html).toContain("The execution layer for AI.");
  expect(html).toContain("© 2026 Torviello");
  const github = html.slice(html.indexOf("GitHub</a>") - 220, html.indexOf("GitHub</a>") + 10);
  expect(github).toContain('target="_blank"');
  expect(github).toContain('rel="noopener noreferrer"');
  expect(html).toContain(">Docs</a>");
});

test("footer brand returns to the top of the page", () => {
  const html = render(SiteFooter, { props: {} }).html;
  expect(html).toContain('href="#top" aria-label="Torviello home"');
});
