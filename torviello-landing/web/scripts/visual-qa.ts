// Copyright (c) 2026 Torviello.
// Visual QA driver — drives the locally installed Chrome through CDP against
// the dev server. Not part of the unit test suite; run manually per the
// evaluation report:
//   bun run qa:visual   (dev server must be running on :5173)
// Checks: menu-button visibility across breakpoints, horizontal overflow
// (F-08), board-composition geometry at the 1536px reference (BC-01), and
// captures full-page screenshots for review.
import { chromium } from "playwright-core";

/** Operator CLI output (OBS-01 scope: this is a CLI, not a runtime service):
 * explicit stream writes, the repository's CLI convention (torviello_roles
 * writes through sys.stdout). */
const out = (line: string): void => void process.stdout.write(`${line}\n`);

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = process.argv[2] ?? "./qa-out";
const widths = [1536, 1440, 1280, 1024, 768, 390, 375, 320];
const heights: Record<number, number> = {
  1536: 1012,
  1440: 900,
  1280: 800,
  1024: 768,
  768: 1024,
  390: 844,
  375: 812,
  320: 900,
};

const browser = await chromium.launch({
  executablePath: chrome,
  args: ["--disable-gpu"],
});

let failures = 0;

for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: heights[width] ?? 900 },
  });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  // LP-09 reveal: walk the page so IntersectionObserver reveals fire before
  // the full-page capture (the fallback timer is the safety net). The walk
  // forces instant jumps — the page's smooth scroll-behavior would otherwise
  // animate every step and never reach the lower sections.
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(900);

  const report = await page.evaluate(() => {
    const menu = document.querySelector(".tv-navbar__menu");
    const menuDisplay = menu ? getComputedStyle(menu).display : "missing";
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const h1Count = document.querySelectorAll("h1").length;
    const menuBox = menu ? JSON.parse(JSON.stringify(menu.getBoundingClientRect())) : null;
    const canvas = document.querySelector(".tv-canvas");
    const hero = document.querySelector(".tv-hero");
    const topnav = document.querySelector(".tv-topnav");
    const cards = [...document.querySelectorAll(".tv-showcase-grid > *")];
    const cardHeights = cards.map((card) =>
      Math.round(card.getBoundingClientRect().height),
    );
    const terminalBand = document.querySelector(".tv-terminal-band");
    const proof = document.querySelector(".tv-proof");
    const proofSlots = document.querySelectorAll(".tv-proof__value[data-pending]").length;
    const cta = document.querySelector(".tv-cta");
    const canvasWidth = canvas ? canvas.getBoundingClientRect().width : 0;
    const heroWidth = hero ? hero.getBoundingClientRect().width : 0;
    // LP-12 (ticket 0049): every canvas section except the full-bleed hero
    // shares the nav's content rail, and a section title followed directly by
    // content (not its subline) keeps at least a 24px gap.
    const navInner = document.querySelector(".tv-topnav .tv-navbar__inner");
    const navLeft = navInner ? navInner.getBoundingClientRect().left : 0;
    const railSections = canvas
      ? [...canvas.children].filter((child) => !child.classList.contains("tv-hero"))
      : [];
    const railOffsets = railSections.map((section) => {
      const box = section.getBoundingClientRect();
      return { left: Math.round(box.left - navLeft), width: Math.round(box.width) };
    });
    const titleGaps = [...document.querySelectorAll(".tv-section__title")]
      .filter((title) => title.nextElementSibling && !title.nextElementSibling.classList.contains("tv-section__sub"))
      .map((title) =>
        Math.round(
          (title.nextElementSibling as Element).getBoundingClientRect().top - title.getBoundingClientRect().bottom,
        ),
      );
    return {
      railOffsets,
      titleGaps,
      menuDisplay,
      overflow,
      h1Count,
      menuBox,
      cardCount: cards.length,
      cardHeights,
      terminalBand: Boolean(terminalBand),
      proof: Boolean(proof),
      proofSlots,
      cta: Boolean(cta),
      // LP-01: the nav wrapper must be position sticky at desktop widths.
      navSticky: topnav ? getComputedStyle(topnav).position === "sticky" : false,
      canvasWidth,
      heroWidth,
    };
  });

  const menuVisible = width < 768 ? report.menuDisplay !== "none" : report.menuDisplay === "none";
  const overflowOk = report.overflow <= 0;
  if (!menuVisible || !overflowOk || report.h1Count !== 1) failures += 1;

  // LP-12: the rail holds at the desktop steps; the title gap holds everywhere.
  const railOk =
    width < 1280 ||
    report.railOffsets.every((offset) => Math.abs(offset.left) <= 2 && offset.width <= 1200);
  const gapOk = report.titleGaps.every((gap) => gap >= 24);
  if (!railOk || !gapOk) failures += 1;
  out(
    `      rail:${railOk ? "ok" : "FAIL " + JSON.stringify(report.railOffsets)}  title-gaps:${report.titleGaps.join("/")}(${gapOk ? "ok" : "FAIL"})`,
  );

  // Ticket 0041: the sticky nav, unboxed hero, proof band with pending slots,
  // CTA band, three equal-height cards, and the terminal band must all hold.
  if (width === 1536) {
    const heroFullWidth = report.canvasWidth > 0 && report.heroWidth >= report.canvasWidth - 40;
    const cardsOk =
      report.cardCount === 3 &&
      report.cardHeights.length === 3 &&
      Math.max(...report.cardHeights) - Math.min(...report.cardHeights) <= 2;
    const bandsOk = report.terminalBand && report.proof && report.cta && report.navSticky;
    if (!heroFullWidth || !cardsOk || !bandsOk || report.proofSlots !== 3) failures += 1;
    out(
      `      nav:sticky(${report.navSticky ? "ok" : "FAIL"})  hero:full-width ${Math.round(report.heroWidth)}/${Math.round(report.canvasWidth)}(${heroFullWidth ? "ok" : "FAIL"})  cards:${report.cardCount} heights=${report.cardHeights.join("/")}(${cardsOk ? "ok" : "FAIL"})  proof:${report.proof ? "ok" : "FAIL"}(${report.proofSlots} pending)  terminal-band:${report.terminalBand ? "ok" : "FAIL"}  cta:${report.cta ? "ok" : "FAIL"}`,
    );
  }

  out(
    `${String(width).padStart(4)}px  menu:${report.menuDisplay}(${
      menuVisible ? "ok" : "FAIL"
    })  overflow:${report.overflow}px(${overflowOk ? "ok" : "FAIL"})  h1:${report.h1Count}` +
      (report.menuBox ? `  menu-box:${Math.round(report.menuBox.x)},${Math.round(report.menuBox.y)} ${Math.round(report.menuBox.width)}x${Math.round(report.menuBox.height)}` : "")
  );

  await page.screenshot({ path: `${outDir}/${width}.png`, fullPage: true });
  await page.close();
}

await browser.close();
out(failures === 0 ? "VISUAL QA PASS" : `VISUAL QA: ${failures} width(s) failing`);
process.exit(failures === 0 ? 0 : 1);
