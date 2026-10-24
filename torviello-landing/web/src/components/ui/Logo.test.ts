// Copyright (c) 2026 Torviello.
// Sheet A5 + GOV-12.07: the lockup renders the canonical mark, not a fork.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import Logo from "./Logo.svelte";
import { logoMark } from "../../lib/brand";

test("logo renders the canonical ribbon-T mark from the design unit", () => {
  const html = render(Logo, { props: {} }).html;
  expect(html).toContain('class="tv-logo__mark"');
  expect(html).toContain('aria-label="Torviello home"');
  const mark = html.slice(html.indexOf("tv-logo__mark"));
  const legStart = logoMark.match(/d="M42 6.8[^"]+"/)?.[0] ?? "M42 6.8 MISSING";
  expect(mark).toContain(legStart);
});

test("the published mark equals the design unit asset, not a local fork", () => {
  expect(logoMark).toContain("<svg");
  expect(logoMark).toContain("M42 6.8");
  expect(logoMark).not.toContain("M6 12.5");
});
