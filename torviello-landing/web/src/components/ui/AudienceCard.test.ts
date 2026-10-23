// Copyright (c) 2026 Torviello.
// Sheet M4 + functional design F-06.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import AudienceCard from "./AudienceCard.svelte";

test("audience card reads eyebrow then heading then body", () => {
  const html = render(AudienceCard, {
    props: { eyebrow: "For builders", heading: "From idea to impact.", body: "Ship in days." },
  }).html;
  const eyebrowAt = html.indexOf("tv-audience-card__eyebrow");
  const headingAt = html.indexOf(">From idea to impact.</");
  const bodyAt = html.indexOf(">Ship in days.</");
  expect(eyebrowAt).toBeGreaterThan(-1);
  expect(headingAt).toBeGreaterThan(eyebrowAt);
  expect(bodyAt).toBeGreaterThan(headingAt);
  expect(html).toContain("tv-audience-card");
});

test("audience card eyebrow uses the accent label", () => {
  const html = render(AudienceCard, {
    props: { eyebrow: "For AI teams", heading: "Build, deploy, scale together.", body: "One workflow." },
  }).html;
  expect(html).toContain("tv-section-label tv-section-label--accent");
});

test("audience card photo is a decorative aria-hidden background", () => {
  const html = render(AudienceCard, {
    props: {
      eyebrow: "For real-world AI",
      heading: "Models in motion.",
      body: "Deployed at the edge.",
      image: "/photos/real-world.jpg",
    },
  }).html;
  expect(html).toContain('class="tv-audience-card__photo"');
  expect(html).toContain('src="/photos/real-world.jpg"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('alt=""');

  const withoutImage = render(AudienceCard, {
    props: { eyebrow: "For builders", heading: "From idea to impact.", body: "Ship in days." },
  }).html;
  expect(withoutImage).not.toMatch(/<img/);
});

test("audience card is non-interactive in slice one", () => {
  const html = render(AudienceCard, {
    props: { eyebrow: "For builders", heading: "From idea to impact.", body: "Ship in days." },
  }).html;
  expect(html).not.toMatch(/<button|<a |tabindex/i);
});
