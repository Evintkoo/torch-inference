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

test("audience card renders exactly one ghost action below the body", () => {
  const html = render(AudienceCard, {
    props: {
      eyebrow: "For builders",
      heading: "From idea to impact.",
      body: "Ship in days.",
      action: {
        label: "Start building →",
        href: "https://docs.torviello.dev/install",
      },
    },
  }).html;
  expect(html.match(/<a /g)).toHaveLength(1);
  expect(html).toContain("tv-button--ghost");
  expect(html).toContain(">Start building →</a>");
  expect(html).toContain('href="https://docs.torviello.dev/install"');

  const bodyAt = html.indexOf(">Ship in days.</p>");
  const actionAt = html.indexOf(">Start building →</a>");
  expect(actionAt).toBeGreaterThan(bodyAt);
});

test("audience card DOM order reads eyebrow heading body action", () => {
  const html = render(AudienceCard, {
    props: {
      eyebrow: "For AI teams",
      heading: "Build, deploy, scale together.",
      body: "One workflow.",
      action: { label: "Read the docs →", href: "https://docs.torviello.dev" },
    },
  }).html;
  const eyebrowAt = html.indexOf("tv-audience-card__eyebrow");
  const headingAt = html.indexOf(">Build, deploy, scale together.</");
  const bodyAt = html.indexOf(">One workflow.</p>");
  const actionAt = html.indexOf(">Read the docs →</a>");
  expect(eyebrowAt).toBeGreaterThan(-1);
  expect(headingAt).toBeGreaterThan(eyebrowAt);
  expect(bodyAt).toBeGreaterThan(headingAt);
  expect(actionAt).toBeGreaterThan(bodyAt);
});

test("external audience action opens a new tab safely and internal does not", () => {
  const external = render(AudienceCard, {
    props: {
      eyebrow: "For real-world AI",
      heading: "Models in motion.",
      body: "Deployed at the edge.",
      action: {
        label: "See it on GitHub →",
        href: "https://github.com/torviello",
        external: true,
      },
    },
  }).html;
  expect(external).toContain('target="_blank"');
  expect(external).toContain('rel="noopener noreferrer"');

  const internal = render(AudienceCard, {
    props: {
      eyebrow: "For builders",
      heading: "From idea to impact.",
      body: "Ship in days.",
      action: { label: "Start building →", href: "/install" },
    },
  }).html;
  expect(internal).not.toContain('target="_blank"');
  expect(internal).not.toContain("noopener");
});

test("audience action pairs an icon with its label per house rule 10", () => {
  const html = render(AudienceCard, {
    props: {
      eyebrow: "For real-world AI",
      heading: "Models in motion.",
      body: "Deployed at the edge.",
      action: {
        label: "See it on GitHub →",
        href: "https://github.com/torviello",
        external: true,
        icon: "github",
      },
    },
  }).html;
  const action = html.slice(
    html.indexOf("tv-audience-card__action"),
    html.indexOf("See it on GitHub →</a>")
  );
  expect(action).toContain('class="tv-icon"');
  expect(action).toContain('aria-hidden="true"');
});

test("audience card without an action renders no link", () => {
  const html = render(AudienceCard, {
    props: { eyebrow: "For builders", heading: "From idea to impact.", body: "Ship in days." },
  }).html;
  expect(html).not.toMatch(/<a /);
});
