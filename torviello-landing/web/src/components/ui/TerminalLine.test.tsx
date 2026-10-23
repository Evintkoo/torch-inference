// Copyright (c) 2026 Torviello.
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TerminalLine } from "./TerminalLine";

test("terminal line renders a prompt line with a hidden marker", () => {
  const html = renderToStaticMarkup(
    <TerminalLine>pip install torviello</TerminalLine>
  );
  assert.match(html, /tv-terminal-line--prompt/);
  assert.match(html, /aria-hidden="true"\>\$</);
  assert.match(html, />pip install torviello</);
});

test("terminal line renders status lines with the teal bullet", () => {
  const html = renderToStaticMarkup(
    <TerminalLine kind="status">Loading model…</TerminalLine>
  );
  assert.match(html, /tv-terminal-line--status/);
  assert.match(html, /aria-hidden="true"\>•</);
  assert.match(html, />Loading model…</);
});

test("terminal lines are real text nodes, selectable and searchable", () => {
  const html = renderToStaticMarkup(
    <TerminalLine>torviello serve --model my-model</TerminalLine>
  );
  assert.match(html, />torviello serve --model my-model</);
  assert.doesNotMatch(html, /<img|<canvas|background-image/);
});
