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

test("the redesigned page mounts the sticky nav, hero, proof, and bands in place", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  // LP-01: one nav at template level in a sticky wrapper; no nested hero nav.
  const navs = document.querySelectorAll('nav[aria-label="Main"]');
  expect(navs).toHaveLength(1);
  expect(navs[0]!.closest(".tv-topnav")).toBeTruthy();
  expect(document.querySelector(".tv-hero")?.querySelector('nav[aria-label="Main"]')).toBeNull();

  // LP-02…LP-07: the redesigned sections all mount.
  expect(document.querySelector(".tv-hero")).toBeTruthy();
  expect(document.querySelector(".tv-values")).toBeTruthy();
  expect(document.querySelector(".tv-proof")).toBeTruthy();
  expect(document.querySelector(".tv-terminal-band")).toBeTruthy();
  expect(document.querySelector(".tv-cta")).toBeTruthy();
  expect(document.querySelector('aside[aria-label="Brand identity"]')).toBeNull();
  expect(document.querySelectorAll("h1")).toHaveLength(1);

  unmount(app);
  target.remove();
});

test("the hero renders the decorative artwork and the pending proof band", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  const hero = document.querySelector(".tv-hero")!;
  expect(hero.querySelector(".tv-artwork")?.getAttribute("aria-hidden")).toBe("true");
  expect(hero.textContent).not.toContain("Documented engine session");

  // The verified transcript lives in the session band.
  const session = document.querySelector(".tv-session")!;
  expect(session.textContent).toContain("Documented engine session");
  expect(session.textContent).toContain('"event":"startup"');

  const slots = document.querySelectorAll(".tv-proof__value[data-pending]");
  expect(slots).toHaveLength(3);
  for (const slot of slots) expect(slot.textContent).not.toMatch(/\d/);
  expect(document.querySelector(".tv-proof")?.textContent).toContain(
    "No performance number is claimed until the first benchmark run publishes",
  );

  unmount(app);
  target.remove();
});

test("the footer renders the mega wordmark and the copy chip is present", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  const mega = document.querySelector(".tv-footer__mega");
  expect(mega?.getAttribute("aria-hidden")).toBe("true");
  expect(document.querySelector('button[aria-label="Copy install command"]')).toBeTruthy();

  unmount(app);
  target.remove();
});

test("the terminal band pairs its copy with the illustrative example in the dom", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);
  const app = mount(App, { target });

  const band = document.querySelector(".tv-terminal-band")!;
  expect(band.querySelector("h2")?.textContent).toContain("Up and running in minutes.");
  const label = band.querySelector(".tv-terminal-card__note");
  expect(label?.textContent).toContain("Illustrative example");
  expect(band.textContent).toContain("pip install torviello");
  expect(band.textContent).toContain("Ready.");

  unmount(app);
  target.remove();
});
