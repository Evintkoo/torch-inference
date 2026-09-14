import "@testing-library/jest-dom/vitest";

// jsdom does not implement window.matchMedia. uPlot (Task 7's MetricsChart)
// calls matchMedia at module-import time (to watch devicePixelRatio changes),
// so any test that imports it — even without ever rendering the canvas —
// throws "matchMedia is not a function" without this polyfill.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom implements neither of these, but Radix's Select (used for every
// dropdown — TTS engine/voice, Detect model pickers, log line count, chat
// model) calls them while opening/positioning its popper content.
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

// jsdom has no ResizeObserver; Radix's Select measures its trigger/content
// with one, and without even a no-op stub it falls back to a slow polling
// path that makes every open-a-dropdown test take several real seconds.
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
