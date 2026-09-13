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
