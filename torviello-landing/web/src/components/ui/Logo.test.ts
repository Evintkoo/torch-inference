// Copyright (c) 2026 Torviello.
// Sheet A5 + GOV-12.07: the lockup renders the canonical potrace mark from
// the design unit, never a local fork (the 0023 triangles must not return).
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import Logo from "./Logo.svelte";
import { logoMark } from "../../lib/brand";

test("logo renders the canonical traced mark from the design unit", () => {
  const html = render(Logo, { props: {} }).html;
  expect(html).toContain('class="tv-logo__mark"');
  expect(html).toContain('aria-label="Torviello home"');
  const mark = html.slice(html.indexOf("tv-logo__mark"));
  const firstPath = logoMark.match(/d="M[0-9.]+ [0-9.]+[^"]+"/)?.[0] ?? "MISSING";
  expect(mark).toContain(firstPath);
});

test("the published mark is the board trace, not an off-brand fork", () => {
  expect(logoMark).toContain("<svg");
  expect(logoMark).toContain("M66775 66995");
  expect(logoMark).not.toContain("M6 12.5");
  expect(logoMark).not.toContain("M42 6.8");
  expect(logoMark).not.toContain("M3155 3183");
});
