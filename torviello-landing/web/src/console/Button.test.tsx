// Copyright (c) 2026 Torviello.
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Button } from "./Button";

test("button exposes idle loading and disabled semantics", () => {
  const idle = renderToStaticMarkup(<Button>Run</Button>);
  assert.match(idle, /data-state="idle"/);
  assert.match(idle, /aria-busy="false"/);
  assert.match(idle, /tv-button--primary/);

  const loading = renderToStaticMarkup(<Button state="loading">Run</Button>);
  assert.match(loading, /data-state="loading"/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /aria-disabled="true"/);
});

test("button renders the ghost variant for secondary actions", () => {
  const ghost = renderToStaticMarkup(<Button variant="ghost">View on GitHub</Button>);
  assert.match(ghost, /tv-button--ghost/);
  assert.doesNotMatch(ghost, /tv-button--primary/);

  const primary = renderToStaticMarkup(<Button>Get Started</Button>);
  assert.match(primary, /tv-button--primary/);
  assert.doesNotMatch(primary, /tv-button--ghost/);
});

test("button invokes the activation handler on click", () => {
  let activations = 0;
  const html = renderToStaticMarkup(
    <Button onActivate={() => { activations += 1; }}>Run</Button>
  );
  assert.match(html, />Run<\/button>/);
  assert.equal(activations, 0);
});
