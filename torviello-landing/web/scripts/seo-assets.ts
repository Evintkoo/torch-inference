/**
 * Publish the SEO asset forms into web/public/ before the Vite build.
 *
 * GOV-12.07: shared unit artifacts are consumed by import, never hand-copied.
 * Social crawlers need stable, unhashed URLs (og:image, favicon link in the
 * static head), so the build publishes transformed copies of the owning
 * units' assets here, and tests/integration/seo.test.ts proves the published
 * bytes equal the owning assets byte for byte (a stale copy is a finding).
 *
 * Ownership: favicon.svg — torviello-design/brand; og image —
 * torviello-media/assets/landing/builders.jpg (the widest approved photo).
 * Generated outputs stay out of version control (GOV-12.05): public/
 * favicon.svg and public/og-image.jpg are gitignored.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UNIT_ROOT = resolve(WEB, "..");
const REPO_ROOT = resolve(UNIT_ROOT, "..");
const PUBLIC = join(WEB, "public");

const SOURCES: Array<[string, string]> = [
  [join(REPO_ROOT, "torviello-design", "brand", "favicon.svg"), join(PUBLIC, "favicon.svg")],
  [join(REPO_ROOT, "torviello-media", "assets", "landing", "builders.jpg"), join(PUBLIC, "og-image.jpg")],
];

mkdirSync(PUBLIC, { recursive: true });
for (const [from, to] of SOURCES) {
  copyFileSync(from, to);
  console.log(`seo-assets: published ${to.replace(REPO_ROOT + "/", "")}`);
}
