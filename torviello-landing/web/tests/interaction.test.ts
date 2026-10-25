// Copyright (c) 2026 Torviello.
// Interaction QA category — mounts the real app in a happy-dom DOM and
// exercises behavior the server-render suite cannot reach (F-01, F-08).
// Prerequisite: run with the client compiler via
//   SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { expect, test } from "bun:test";

GlobalRegistrator.register();

// The bare "svelte" specifier resolves to the server runtime under Bun's
// default export conditions, so the client API comes in by file path.
// @ts-expect-error - deep runtime entry without bundled declarations
import { flushSync, mount, unmount } from "../node_modules/svelte/src/index-client.js";

import App from "../src/App.svelte";

test("the composed app mounts with landmarks and anchors in place", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  expect(document.querySelector('nav[aria-label="Main"]')).toBeTruthy();
  expect(document.querySelectorAll("h1")).toHaveLength(1);
  expect(document.getElementById("product")).toBeTruthy();
  expect(document.getElementById("use-cases")).toBeTruthy();
  expect(document.getElementById("community")).toBeTruthy();

  unmount(app);
  target.remove();
});

test("the slice-two audience actions are reachable interactive links", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  const actions = [
    ...document.querySelectorAll<HTMLAnchorElement>(".tv-audience-card .tv-button--ghost"),
  ];
  expect(actions.map((a) => a.textContent?.trim())).toEqual([
    "Start building",
    "Read the docs",
    "See it on GitHub",
  ]);
  expect(actions.every((a) => a.getAttribute("href"))).toBe(true);
  const [, docs, github] = actions;
  expect(docs?.target).toBe("_blank");
  expect(docs?.rel).toContain("noopener");
  expect(github?.target).toBe("_blank");
  expect(github?.rel).toContain("noopener");

  unmount(app);
  target.remove();
});

test("the mobile menu button toggles aria-expanded and the list state", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  const menu = document.querySelector<HTMLButtonElement>(".tv-navbar__menu")!;
  const nav = document.getElementById("tv-navbar-links")!;
  expect(menu.getAttribute("aria-expanded")).toBe("false");
  expect(menu.getAttribute("aria-controls")).toBe("tv-navbar-links");
  expect(nav.getAttribute("data-menu")).toBe("closed");

  menu.click();
  flushSync();
  expect(menu.getAttribute("aria-expanded")).toBe("true");
  expect(nav.getAttribute("data-menu")).toBe("open");

  menu.click();
  flushSync();
  expect(menu.getAttribute("aria-expanded")).toBe("false");
  expect(nav.getAttribute("data-menu")).toBe("closed");

  unmount(app);
  target.remove();
});

test("the board composition mounts the brand panel, flow, and terminal card", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  expect(document.querySelector('aside[aria-label="Brand identity"]')).toBeTruthy();
  expect(document.querySelector(".tv-flow")?.getAttribute("aria-hidden")).toBe("true");
  expect(document.querySelector(".tv-showcase-card--terminal")).toBeTruthy();
  expect(document.querySelector(".tv-canvas")).toBeTruthy();

  unmount(app);
  target.remove();
});

test("the terminal showcase example is labeled illustrative in the dom", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  const label = document.querySelector(".tv-terminal-card__note");
  expect(label?.textContent).toContain("Illustrative example");
  const card = document.querySelector(".tv-showcase-card--terminal")!;
  expect(card.textContent).toContain("pip install torviello");
  expect(card.textContent).toContain("Ready.");

  unmount(app);
  target.remove();
});
