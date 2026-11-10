// Copyright (c) 2026 Torviello.
// Landing redesign (ticket 0041, LP-09 amendment): the scroll-reveal action
// (feature layer since ticket 0048).
// Marks the node with data-reveal, then data-revealed once it intersects.
// Motion-unsafe environments (reduced motion, no IntersectionObserver) return
// untouched, and a fallback timer force-reveals so content is never
// permanently hidden — crawlers, print, and stalled observers included.
export function reveal(node: HTMLElement, options?: { delay?: number }) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof IntersectionObserver === "undefined") return;

  node.setAttribute("data-reveal", "");
  if (options?.delay) {
    node.style.transitionDelay = `${options.delay}ms`;
  }

  const show = () => node.setAttribute("data-revealed", "");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          show();
          observer.disconnect();
          clearTimeout(fallback);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  observer.observe(node);
  const fallback = setTimeout(show, 2500);

  return () => {
    observer.disconnect();
    clearTimeout(fallback);
    node.style.transitionDelay = "";
    node.removeAttribute("data-reveal");
    node.removeAttribute("data-revealed");
  };
}
