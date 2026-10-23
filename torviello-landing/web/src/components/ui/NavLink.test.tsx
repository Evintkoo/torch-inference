// Copyright (c) 2026 Torviello.
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { NavLink } from "./NavLink";

test("navlink renders href and the token-driven class", () => {
  const html = renderToStaticMarkup(<NavLink href="#product">Product</NavLink>);
  assert.match(html, /class="tv-navlink"/);
  assert.match(html, /href="#product"/);
  assert.doesNotMatch(html, /aria-current/);
});

test("navlink marks the current section with aria-current", () => {
  const html = renderToStaticMarkup(
    <NavLink href="#product" current>
      Product
    </NavLink>
  );
  assert.match(html, /aria-current="true"/);
});

test("navlink can open an external target safely", () => {
  const html = renderToStaticMarkup(
    <NavLink href="https://github.com/torviello" target="_blank" rel="noopener noreferrer">
      GitHub
    </NavLink>
  );
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
});
