// Copyright (c) 2026 Torviello.
// Sheet T1 — fixed nav slot, stacked section slots, footer slot.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import LandingTemplate from "./LandingTemplate.svelte";

test("template renders nav sections and footer slots in order", () => {
  const html = render(LandingTemplate, {
    props: {
      // Mirror the server-compiled snippet signature: a function that pushes
      // markup into the server renderer.
      nav: ($$renderer: { push: (value: string) => void }) => $$renderer.push("NAV-CONTENT"),
      children: ($$renderer: { push: (value: string) => void }) => $$renderer.push("SECTION-CONTENT"),
      footer: ($$renderer: { push: (value: string) => void }) => $$renderer.push("FOOTER-CONTENT"),
    },
  }).html;
  expect(html).toContain('class="tv-template__nav"');
  expect(html).toContain('class="tv-template__main"');
  expect(html).toContain('class="tv-template__footer"');
  const navAt = html.indexOf("NAV-CONTENT");
  const sectionsAt = html.indexOf("SECTION-CONTENT");
  const footerAt = html.indexOf("FOOTER-CONTENT");
  expect(navAt).toBeGreaterThan(-1);
  expect(sectionsAt).toBeGreaterThan(navAt);
  expect(footerAt).toBeGreaterThan(sectionsAt);
});
