/**
 * Publish the SEO asset forms into web/public/ before the Vite build.
 *
 * GOV-12.07: shared unit artifacts are consumed by import, never hand-copied.
 * Social crawlers need stable, unhashed URLs (og:image, favicon link in the
 * static head), so the build publishes transformed copies of the owning
 * units' assets here, and tests/integration/seo.test.ts proves the published
 * bytes equal the owning assets byte for byte (a stale copy is a finding).
 *
 * The canonical base URL lives ONLY in web/.env (VITE_SITE_URL — ticket
 * 0047: the interim value is the live GitHub Pages URL; flip it to
 * https://torviello.dev/ once the domain is registered and wired as the
 * Pages custom domain). This script generates robots.txt and sitemap.xml
 * from that single source; the built index.html consumes the same value
 * through Vite's %VITE_SITE_URL% replacement.
 *
 * Ownership: favicon.svg — torviello-design/brand; og image —
 * torviello-media/assets/landing/builders.jpg (the widest approved photo).
 * Generated outputs stay out of version control (GOV-12.05): public/
 * favicon.svg, og-image.jpg, robots.txt, and sitemap.xml are gitignored.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UNIT_ROOT = resolve(WEB, "..");
const REPO_ROOT = resolve(UNIT_ROOT, "..");
const PUBLIC = join(WEB, "public");

/** Single source of truth for the canonical base URL. */
function siteUrl(): string {
  const env = readFileSync(join(WEB, ".env"), "utf8");
  const value = env.split("\n").find((line) => line.startsWith("VITE_SITE_URL="));
  const url = value?.slice("VITE_SITE_URL=".length).trim();
  if (!url || !/^https?:\/\/[A-Za-z0-9./_-]+$/.test(url)) {
    throw new Error(`seo-assets: invalid or missing VITE_SITE_URL in web/.env: ${value}`);
  }
  return url.replace(/\/+$/, "");
}

const SOURCES: Array<[string, string]> = [
  [join(REPO_ROOT, "torviello-design", "brand", "favicon.svg"), join(PUBLIC, "favicon.svg")],
  [join(REPO_ROOT, "torviello-media", "assets", "landing", "builders.jpg"), join(PUBLIC, "og-image.jpg")],
];

mkdirSync(PUBLIC, { recursive: true });
for (const [from, to] of SOURCES) {
  copyFileSync(from, to);
  console.log(`seo-assets: published ${to.replace(REPO_ROOT + "/", "")}`);
}

const base = siteUrl();
writeFileSync(
  join(PUBLIC, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
);
writeFileSync(
  join(PUBLIC, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${base}/</loc>\n    <lastmod>2026-11-09</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
);
console.log(`seo-assets: generated robots.txt + sitemap.xml for ${base}`);
