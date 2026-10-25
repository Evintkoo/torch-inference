// Copyright (c) 2026 Torviello.
// Sheet O5 (slice 3, ticket 0038) — the inference-flow artwork renders three
// ordered decorative stages over an aria-hidden SVG stream.
import { expect, test } from "bun:test";
import { render } from "svelte/server";

import InferenceFlow from "./InferenceFlow.svelte";

const icon = '<svg viewBox="0 0 24 24"></svg>';
const stages = [
  { icon, title: "DEVELOP", caption: "Experiment, iterate, and optimize." },
  { icon, title: "DEPLOY", caption: "Scale with confidence." },
  { icon, title: "INFER", caption: "Real-world impact." },
];

test("flow renders the three stages in board order with captions", () => {
  const html = render(InferenceFlow, { props: { stages } }).html;
  const develop = html.indexOf(">DEVELOP</p>");
  const deploy = html.indexOf(">DEPLOY</p>");
  const infer = html.indexOf(">INFER</p>");
  expect(develop).toBeGreaterThan(-1);
  expect(deploy).toBeGreaterThan(develop);
  expect(infer).toBeGreaterThan(deploy);
  expect(html).toContain("Experiment, iterate, and optimize.");
  expect(html).toContain("Scale with confidence.");
  expect(html).toContain("Real-world impact.");
});

test("flow artwork is one decorative aria-hidden region with the stream svg", () => {
  const html = render(InferenceFlow, { props: { stages } }).html;
  expect(html).toContain('class="tv-flow" aria-hidden="true"');
  expect(html).toContain("<svg");
  expect(html).toContain("tv-flow__stream");
});

test("flow stages reuse the glass card molecule with stage variants", () => {
  const html = render(InferenceFlow, { props: { stages } }).html;
  expect(html.match(/tv-glass-card"/g)).toHaveLength(3);
  expect(html).toContain('data-stage="develop"');
  expect(html).toContain('data-stage="deploy"');
  expect(html).toContain('data-stage="infer"');
});

test("flow stage icons are decorative inline svg per house rule 10", () => {
  const html = render(InferenceFlow, { props: { stages } }).html;
  expect(html.match(/tv-glass-card__icon" aria-hidden="true"/g)?.length ?? 0).toBe(3);
});
