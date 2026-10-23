// Copyright (c) 2026 Torviello.
// Sheet A3 — ported from the 0020 React suite to the Svelte stack.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import NavLink from "./NavLink.svelte";

test("navlink renders href and the token-driven class", () => {
  const html = render(NavLink, { props: { label: "Product", href: "#product" } }).html;
  expect(html).toContain('class="tv-navlink"');
  expect(html).toContain('href="#product"');
  expect(html).toContain(">Product</a>");
  expect(html).not.toContain("aria-current");
});

test("navlink marks the current section with aria-current", () => {
  const html = render(NavLink, {
    props: { label: "Product", href: "#product", current: true },
  }).html;
  expect(html).toContain('aria-current="true"');
});

test("navlink can open an external target safely", () => {
  const html = render(NavLink, {
    props: {
      label: "GitHub",
      href: "https://github.com/torviello",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  }).html;
  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noopener noreferrer"');
});
