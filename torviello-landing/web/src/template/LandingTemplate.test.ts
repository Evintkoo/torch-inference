// Copyright (c) 2026 Torviello.
// Sheet T1 (slice-3 amendment, ticket 0038) — canvas main + footer slots; the
// nav renders inside the hero panel, not the template.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import LandingTemplate from "./LandingTemplate.svelte";

test("template renders the canvas main and footer slots in order", () => {
  const html = render(LandingTemplate, {
    props: {
      // Mirror the server-compiled snippet signature: a function that pushes
      // markup into the server renderer.
      children: ($$renderer: { push: (value: string) => void }) => $$renderer.push("CANVAS-CONTENT"),
      footer: ($$renderer: { push: (value: string) => void }) => $$renderer.push("FOOTER-CONTENT"),
    },
  }).html;
  expect(html).toContain('class="tv-template__main"');
  expect(html).toContain('class="tv-canvas"');
  expect(html).toContain('class="tv-template__footer"');
  expect(html).not.toContain('class="tv-template__nav"');
  const canvasAt = html.indexOf("CANVAS-CONTENT");
  const footerAt = html.indexOf("FOOTER-CONTENT");
  expect(canvasAt).toBeGreaterThan(-1);
  expect(footerAt).toBeGreaterThan(canvasAt);
});

test("template keeps the skip link and the #top anchor", () => {
  const html = render(LandingTemplate, {
    props: {
      children: ($$renderer: { push: (value: string) => void }) => $$renderer.push(""),
      footer: ($$renderer: { push: (value: string) => void }) => $$renderer.push(""),
    },
  }).html;
  expect(html).toContain('class="tv-skip-link" href="#main"');
  expect(html).toContain('id="top"');
});
