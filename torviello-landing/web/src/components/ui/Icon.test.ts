// Copyright (c) 2026 Torviello.
// Sheet A7 — the icon atom renders sliced brand assets, aria-hidden.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import Icon from "./Icon.svelte";
import { iconNames } from "../../lib/icons";

test("icon atom renders the sliced asset svg inside an aria-hidden span", () => {
  const html = render(Icon, { props: { name: "zap" } }).html;
  expect(html).toContain('class="tv-icon"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain("<svg");
  expect(html).toContain('viewBox="0 0 24 24"');
});

test("icon atom resolves every name in the sliced asset set", () => {
  expect(iconNames).toEqual([
    "zap",
    "layers",
    "sliders",
    "users",
    "box",
    "package",
    "github",
    "arrow-right",
    "book-open",
  ]);
  for (const name of iconNames) {
    const html = render(Icon, { props: { name } }).html;
    expect(html).toContain("<svg");
  }
});
