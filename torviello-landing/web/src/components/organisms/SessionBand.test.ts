// Copyright (c) 2026 Torviello.
// Landing redesign (LP-10, ticket 0041 second amendment): the "A real
// session" band — the documented engine session, the only verified transcript
// on the page, in its own centered window.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import SessionBand from "./SessionBand.svelte";

const session = {
  commands: ["torviello-engine --help", "TORCH_PORT=8000 torviello-engine"],
  output: '{"event":"startup","version":"1.0.0","correlation_id":"…","message":"engine started"}',
};

test("the band heads itself and labels the window as the documented session", () => {
  const html = render(SessionBand, { props: { session } }).html;
  expect(html).toContain(">A real session.</h2>");
  expect(html).toContain("Documented engine session");
});

test("the band shows the documented commands and the startup event", () => {
  const html = render(SessionBand, { props: { session } }).html;
  expect(html).toContain(">torviello-engine --help</span>");
  expect(html).toContain(">TORCH_PORT=8000 torviello-engine</span>");
  expect(html).toContain('"event":"startup"');
  // The verified session never carries the illustrative label.
  expect(html).not.toContain("Illustrative example");
});

test("the band points evaluating visitors at the docs", () => {
  const html = render(SessionBand, { props: { session } }).html;
  expect(html).toContain(">Read the docs</a>");
  const docs = html.slice(html.indexOf("tv-button--ghost"), html.indexOf(">Read the docs</a>"));
  expect(docs).toContain('target="_blank"');
  expect(docs).toContain('rel="noopener noreferrer"');
});
