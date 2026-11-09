/**
 * SEO readiness tests for the landing build output.
 *
 * Specification: specifications/landing-deployment.md — "Search-engine
 * readiness" amendment (SEO-01..SEO-08), owner direction 2026-11-09
 * ("all i want is a public link ... ready to do SEO stuffs").
 *
 * Hermetic (GOV-09.03): a real Vite build runs into the isolated dist-seo
 * directory (never the deploy suite's web/dist), and every assertion is made
 * against the built artifact — the exact bytes a crawler fetches.
 *
 * Trace: canonical base is the declared production URL https://torviello.dev/
 * (HSTS-preloaded TLD: HTTPS is mandatory there from day one).
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const UNIT_ROOT = resolve(import.meta.dir, "../..");
const WEB = join(UNIT_ROOT, "web");
const OUT = join(WEB, "dist-seo");
const REAL_BUN = Bun.which("bun") as string;

/** The canonical base URL comes from web/.env (VITE_SITE_URL) — the single
 * declared source. Tests assert the built artifact matches it exactly. */
const BASE = readFileSync(join(WEB, ".env"), "utf8")
  .split("\n")
  .find((line) => line.startsWith("VITE_SITE_URL="))
  ?.slice("VITE_SITE_URL=".length)
  .trim()
  .replace(/\/+$/, "") as string;
const DESIGN_FAVICON = join(UNIT_ROOT, "..", "torviello-design", "brand", "favicon.svg");
const MEDIA_OG = join(UNIT_ROOT, "..", "torviello-media", "assets", "landing", "builders.jpg");

let html = "";
beforeAll(() => {
  rmSync(OUT, { recursive: true, force: true });
  const res = spawnSync(REAL_BUN, ["run", "build", "--outDir", "dist-seo", "--emptyOutDir"], {
    cwd: WEB,
    encoding: "utf8",
  });
  if (res.status !== 0) throw new Error(`seo build failed: ${res.stderr}`);
  html = readFileSync(join(OUT, "index.html"), "utf8");
});

afterAll(() => {
  rmSync(OUT, { recursive: true, force: true });
});

describe("SEO-01 — primary meta", () => {
  test("title and meta description ship in the built HTML", () => {
    expect(html).toContain("<title>Torviello — The execution layer for AI</title>");
    expect(html).toMatch(/<meta name="description" content="[^"]{50,}"\s*\/?>/);
  });

  test("SEO-02 — canonical URL points at the declared base", () => {
    expect(html).toContain(`<link rel="canonical" href="${BASE}/" />`);
  });

  test("SEO-03 — robots meta allows indexing", () => {
    expect(html).toMatch(/<meta name="robots" content="index, follow"\s*\/?>/);
  });
});

describe("SEO-04 — Open Graph", () => {
  test("og:url matches the canonical base", () => {
    expect(html).toContain(`<meta property="og:url" content="${BASE}/" />`);
  });

  test("og:image is an absolute URL with dimensions and alt text", () => {
    expect(html).toContain(`<meta property="og:image" content="${BASE}/og-image.jpg" />`);
    expect(html).toMatch(/<meta property="og:image:width" content="\d+"\s*\/?>/);
    expect(html).toMatch(/<meta property="og:image:height" content="\d+"\s*\/?>/);
    expect(html).toMatch(/<meta property="og:image:alt" content="[^"]+"\s*\/?>/);
  });

  test("og:locale is declared", () => {
    expect(html).toContain(`<meta property="og:locale" content="en_US" />`);
  });
});

describe("SEO-05 — Twitter card", () => {
  test("summary_large_image card with title, description, and image", () => {
    expect(html).toContain(`<meta name="twitter:card" content="summary_large_image" />`);
    expect(html).toMatch(/<meta name="twitter:title" content="[^"]+"\s*\/?>/);
    expect(html).toMatch(/<meta name="twitter:description" content="[^"]+"\s*\/?>/);
    expect(html).toContain(`<meta name="twitter:image" content="${BASE}/og-image.jpg" />`);
  });
});

describe("SEO-06 — structured data (JSON-LD)", () => {
  test("Organization and WebSite entities declare the canonical base", () => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]);
    expect(blocks.length).toBeGreaterThan(0);
    const parsed = blocks.map((block) => JSON.parse(block));
    const text = JSON.stringify(parsed);
    expect(text).toContain('"Organization"');
    expect(text).toContain('"WebSite"');
    expect(text).toContain(BASE);
  });
});

describe("SEO-07 — crawler files", () => {
  test("robots.txt allows all agents and names the sitemap", () => {
    const robots = readFileSync(join(OUT, "robots.txt"), "utf8");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain(`Sitemap: ${BASE}/sitemap.xml`);
  });

  test("sitemap.xml lists the canonical URL", () => {
    const sitemap = readFileSync(join(OUT, "sitemap.xml"), "utf8");
    expect(sitemap).toContain(`<loc>${BASE}/</loc>`);
    expect(sitemap).toContain("http://www.sitemaps.org/schemas/sitemap/0.9");
  });

  test("favicon.svg is published at a stable URL", () => {
    expect(existsSync(join(OUT, "favicon.svg"))).toBeTrue();
  });
});

describe("SEO-08 — shared-asset sync (GOV-12.07)", () => {
  test("published og-image.jpg equals the owning media unit's asset byte for byte", () => {
    const published = readFileSync(join(OUT, "og-image.jpg"));
    const owned = readFileSync(MEDIA_OG);
    expect(published.equals(owned)).toBeTrue();
  });

  test("published favicon.svg equals the owning design unit's asset byte for byte", () => {
    const published = readFileSync(join(OUT, "favicon.svg"));
    const owned = readFileSync(DESIGN_FAVICON);
    expect(published.equals(owned)).toBeTrue();
  });
});
