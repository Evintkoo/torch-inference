// Copyright (c) 2026 Torviello.
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SectionLabel } from "./SectionLabel";

test("section label renders the eyebrow pattern with muted text", () => {
  const html = renderToStaticMarkup(<SectionLabel>For builders</SectionLabel>);
  assert.match(html, /class="tv-section-label"/);
  assert.match(html, />For builders<\/p>/);
});

test("section label supports the accent variant and an anchor id", () => {
  const html = renderToStaticMarkup(
    <SectionLabel accent id="hero-eyebrow">
      AI-native inference engine
    </SectionLabel>
  );
  assert.match(html, /tv-section-label--accent/);
  assert.match(html, /id="hero-eyebrow"/);
});
