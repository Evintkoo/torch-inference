// Copyright (c) 2026 Torviello.
// Visual QA driver — drives the locally installed Chrome through CDP against
// the dev server. Not part of the unit test suite; run manually per the
// evaluation report:
//   bun run qa:visual   (dev server must be running on :5173)
// Checks: menu-button visibility across breakpoints, horizontal overflow
// (F-08), board-composition geometry at the 1536px reference (BC-01), and
// captures full-page screenshots for review.
import { chromium } from "playwright-core";

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

  const report = await page.evaluate(() => {
    const menu = document.querySelector(".tv-navbar__menu");
    const menuDisplay = menu ? getComputedStyle(menu).display : "missing";
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const h1Count = document.querySelectorAll("h1").length;
    const menuBox = menu ? JSON.parse(JSON.stringify(menu.getBoundingClientRect())) : null;
    const canvas = document.querySelector(".tv-canvas");
    const hero = document.querySelector(".tv-hero-panel");
    const cards = [...document.querySelectorAll(".tv-showcase-grid > *")];
    const cardHeights = cards.map((card) =>
      Math.round(card.getBoundingClientRect().height),
    );
    const terminalBand = document.querySelector(".tv-terminal-band");
    const canvasWidth = canvas ? canvas.getBoundingClientRect().width : 0;
    const heroWidth = hero ? hero.getBoundingClientRect().width : 0;
    return {
      menuDisplay,
      overflow,
      h1Count,
      menuBox,
      cardCount: cards.length,
      cardHeights,
      terminalBand: Boolean(terminalBand),
      canvasWidth,
      heroWidth,
    };
  });

  const menuVisible = width < 768 ? report.menuDisplay !== "none" : report.menuDisplay === "none";
  const overflowOk = report.overflow <= 0;
  if (!menuVisible || !overflowOk || report.h1Count !== 1) failures += 1;

  // Ticket 0040: the hero spans the canvas width (no second column), the row
  // holds exactly three equal-height cards, and the terminal band exists.
  if (width === 1536) {
    const heroFullWidth = report.canvasWidth > 0 && report.heroWidth >= report.canvasWidth - 40;
    const cardsOk =
      report.cardCount === 3 &&
      report.cardHeights.length === 3 &&
      Math.max(...report.cardHeights) - Math.min(...report.cardHeights) <= 2;
    if (!heroFullWidth || !cardsOk || !report.terminalBand) failures += 1;
    console.log(
      `      hero:full-width ${Math.round(report.heroWidth)}/${Math.round(report.canvasWidth)}(${heroFullWidth ? "ok" : "FAIL"})  cards:${report.cardCount} heights=${report.cardHeights.join("/")}(${cardsOk ? "ok" : "FAIL"})  terminal-band:${report.terminalBand ? "ok" : "FAIL"}`,
    );
  }

  console.log(
    `${String(width).padStart(4)}px  menu:${report.menuDisplay}(${
      menuVisible ? "ok" : "FAIL"
    })  overflow:${report.overflow}px(${overflowOk ? "ok" : "FAIL"})  h1:${report.h1Count}` +
      (report.menuBox ? `  menu-box:${Math.round(report.menuBox.x)},${Math.round(report.menuBox.y)} ${Math.round(report.menuBox.width)}x${Math.round(report.menuBox.height)}` : "")
  );

  await page.screenshot({ path: `${outDir}/${width}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log(failures === 0 ? "VISUAL QA PASS" : `VISUAL QA: ${failures} width(s) failing`);
process.exit(failures === 0 ? 0 : 1);
