// Copyright (c) 2026 Torviello.
// Landing redesign T1 (ticket 0041) — the page shell: sticky nav wrapper,
// canvas main, and footer slots; the nav renders at the template level (LP-01).
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import LandingTemplate from "./LandingTemplate.svelte";

const snippets = {
  nav: ($$renderer: { push: (value: string) => void }) => $$renderer.push("NAV-CONTENT"),
  children: ($$renderer: { push: (value: string) => void }) => $$renderer.push("CANVAS-CONTENT"),
  footer: ($$renderer: { push: (value: string) => void }) => $$renderer.push("FOOTER-CONTENT"),
};

test("template renders nav, canvas main, and footer slots in order", () => {
  const html = render(LandingTemplate, { props: snippets }).html;
  expect(html).toContain('class="tv-topnav"');
  expect(html).toContain('class="tv-template__main"');
  expect(html).toContain('class="tv-canvas"');
  expect(html).toContain('class="tv-template__footer"');
  const navAt = html.indexOf("NAV-CONTENT");
  const canvasAt = html.indexOf("CANVAS-CONTENT");
  const footerAt = html.indexOf("FOOTER-CONTENT");
  expect(navAt).toBeGreaterThan(-1);
  expect(canvasAt).toBeGreaterThan(navAt);
  expect(footerAt).toBeGreaterThan(canvasAt);
});

test("template keeps the skip link and the #top anchor", () => {
  const html = render(LandingTemplate, { props: snippets }).html;
  expect(html).toContain('class="tv-skip-link" href="#main"');
  expect(html).toContain('id="top"');
});
