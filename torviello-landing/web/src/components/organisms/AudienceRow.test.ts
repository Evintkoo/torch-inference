// Copyright (c) 2026 Torviello.
// Sheet O3 + functional design F-06.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import AudienceRow from "./AudienceRow.svelte";

const cards = [
  {
    eyebrow: "For builders",
    heading: "From idea to impact.",
    body: "The inference engine that moves with you — from notebooks to production.",
  },
  {
    eyebrow: "For AI teams",
    heading: "Build, deploy, scale together.",
    body: "A unified inference engine for researchers, engineers, and product teams.",
  },
  {
    eyebrow: "For real-world AI",
    heading: "Models in motion.",
    body: "Efficient, adaptable, and ready for production use cases.",
  },
];

test("audience row renders the three board cards in order", () => {
  const html = render(AudienceRow, { props: { cards } }).html;
  expect(html.match(/tv-audience-card"/g)).toHaveLength(3);
  const at = (heading: string) => html.indexOf(`>${heading}</h3>`);
  expect(at("From idea to impact.")).toBeGreaterThan(-1);
  expect(at("Build, deploy, scale together.")).toBeGreaterThan(at("From idea to impact."));
  expect(at("Models in motion.")).toBeGreaterThan(at("Build, deploy, scale together."));
  expect(html).toContain(">For builders</p>");
  expect(html).toContain(">For AI teams</p>");
  expect(html).toContain(">For real-world AI</p>");
  expect(html).toContain("The inference engine that moves with you — from notebooks to production.");
  expect(html).toContain("A unified inference engine for researchers, engineers, and product teams.");
  expect(html).toContain("Efficient, adaptable, and ready for production use cases.");
});
