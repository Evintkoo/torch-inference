// Copyright (c) 2026 Torviello.
// LP-09 scroll reveal (ticket 0041 amendment; feature layer, ticket 0048):
// content is never permanently hidden.
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, beforeAll, expect, test } from "bun:test";

import { reveal } from "./reveal";

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;
let observers: ObserverCallback[] = [];
let reducedMotion = false;

beforeAll(() => {
  GlobalRegistrator.register();
  window.matchMedia = ((query: string) => ({
    matches: reducedMotion && query.includes("reduce"),
  })) as unknown as typeof window.matchMedia;
  globalThis.IntersectionObserver = class {
    constructor(callback: ObserverCallback) {
      observers.push(callback);
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

afterAll(() => GlobalRegistrator.unregister());

test("reduced motion leaves the node untouched", () => {
  reducedMotion = true;
  const node = document.createElement("section");
  expect(reveal(node)).toBeUndefined();
  expect(node.hasAttribute("data-reveal")).toBe(false);
  reducedMotion = false;
});

test("the node is marked, then revealed when it intersects", () => {
  observers = [];
  const node = document.createElement("section");
  const destroy = reveal(node, { delay: 120 });
  expect(node.hasAttribute("data-reveal")).toBe(true);
  expect(node.style.transitionDelay).toBe("120ms");
  expect(node.hasAttribute("data-revealed")).toBe(false);
  observers[0]([{ isIntersecting: true }]);
  expect(node.hasAttribute("data-revealed")).toBe(true);
  destroy?.();
  expect(node.hasAttribute("data-reveal")).toBe(false);
});

test("a stalled observer still reveals through the fallback timer", async () => {
  const node = document.createElement("section");
  reveal(node);
  await new Promise((resolve) => setTimeout(resolve, 2600));
  expect(node.hasAttribute("data-revealed")).toBe(true);
}, 5000);
