// Copyright (c) 2026 Torviello.
// Landing redesign (LP-04, AC-LP-4, ticket 0041) — the proof band shows
// pending metric slots and claims no numbers.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import ProofBand from "./ProofBand.svelte";

const metrics = [{ label: "p99 latency" }, { label: "Throughput" }, { label: "Cold start" }];

test("the proof band heads itself and renders one slot per metric", () => {
  const html = render(ProofBand, { props: { metrics } }).html;
  expect(html).toContain(">Numbers, not claims.</h2>");
  expect(html.match(/tv-proof__slot"/g)).toHaveLength(3);
  expect(html).toContain(">p99 latency</dt>");
  expect(html).toContain(">Throughput</dt>");
  expect(html).toContain(">Cold start</dt>");
});

test("every slot marks its value pending and renders an em-dash, never digits", () => {
  const html = render(ProofBand, { props: { metrics } }).html;
  expect(html.match(/tv-proof__value" data-pending="true">—</g)).toHaveLength(3);
  expect(html.match(/First benchmark pending/g)).toHaveLength(3);
  expect(html.match(/tv-proof__value"[^>]*>[^<]*\d[^<]*</g)).toBeNull();
});

test("the footnote states no number is claimed before the benchmark publishes", () => {
  const html = render(ProofBand, { props: { metrics } }).html;
  expect(html).toContain(
    "No performance number is claimed until the first benchmark run publishes",
  );
});
