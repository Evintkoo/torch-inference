// Copyright (c) 2026 Torviello.
// Landing redesign (LP-07, AC-LP-7, ticket 0041) — the closing CTA band on
// the brand gradient with an inverse primary and a safe ghost action.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import CtaBand from "./CtaBand.svelte";

const base = {
  heading: "Start building today.",
  body: "From install to a running server — the docs walk you through every step.",
  primaryLabel: "Get Started",
  primaryHref: "https://github.com/Evintkoo/torch-inference/blob/main/torviello-docs/docs/INSTALL.md",
  ghostLabel: "View on GitHub",
  githubHref: "https://github.com/torviello",
};

test("the CTA band renders its heading, supporting line, and both actions", () => {
  const html = render(CtaBand, { props: base }).html;
  expect(html).toContain(">Start building today.</h2>");
  expect(html).toContain("From install to a running server — the docs walk you through every step.");
  expect(html).toContain('class="tv-button tv-button--inverse" href="https://github.com/Evintkoo/torch-inference/blob/main/torviello-docs/docs/INSTALL.md"');
  expect(html).toContain(">Get Started</a>");
  expect(html).toContain(">View on GitHub</a>");
});

test("the ghost action stays a safe external link with a paired icon", () => {
  const html = render(CtaBand, { props: base }).html;
  const ghost = html.slice(html.indexOf("tv-button--ghost"), html.indexOf(">View on GitHub</a>"));
  expect(ghost).toContain('target="_blank"');
  expect(ghost).toContain('rel="noopener noreferrer"');
  expect(html).toContain('class="tv-icon"');
});
