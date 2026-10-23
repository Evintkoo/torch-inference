// Copyright (c) 2026 Torviello.
// Sheet O2 + functional design F-05.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import FeatureStrip from "./FeatureStrip.svelte";

const items = [
  { icon: "<svg></svg>", title: "High Performance", subcopy: "Optimized for real workloads" },
  { icon: "<svg></svg>", title: "Flexible Deployment", subcopy: "Cloud, on-prem, or edge" },
  { icon: "<svg></svg>", title: "Developer & AI Native Friendly", subcopy: "Simple APIs, powerful control" },
  { icon: "<svg></svg>", title: "Built for Real Teams", subcopy: "From research to production" },
];

test("feature strip renders the four board items in order", () => {
  const html = render(FeatureStrip, { props: { items } }).html;
  expect(html.match(/tv-feature-item"/g)).toHaveLength(4);
  const at = (title: string) => html.indexOf(`>${title}</h3>`);
  expect(at("High Performance")).toBeGreaterThan(-1);
  expect(at("Flexible Deployment")).toBeGreaterThan(at("High Performance"));
  expect(at("Developer &amp; AI Native Friendly")).toBeGreaterThan(at("Flexible Deployment"));
  expect(at("Built for Real Teams")).toBeGreaterThan(at("Developer &amp; AI Native Friendly"));
  expect(html).toContain("Optimized for real workloads");
  expect(html).toContain("Cloud, on-prem, or edge");
  expect(html).toContain("Simple APIs, powerful control");
  expect(html).toContain("From research to production");
});
