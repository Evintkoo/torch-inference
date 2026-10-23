// Copyright (c) 2026 Torviello.
// Visual QA driver — drives the locally installed Chrome through CDP against
// the dev server. Not part of the unit test suite; run manually per the
// evaluation report:
//   bun run qa:visual   (dev server must be running on :5173)
// Checks: menu-button visibility across breakpoints, horizontal overflow
// (F-08), and captures full-page screenshots for review.
import { chromium } from "playwright-core";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = process.argv[2] ?? "./qa-out";
const widths = [1440, 1024, 768, 390, 320];

const browser = await chromium.launch({
  executablePath: chrome,
  args: ["--disable-gpu"],
});

let failures = 0;

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

  const report = await page.evaluate(() => {
    const menu = document.querySelector(".tv-navbar__menu");
    const menuDisplay = menu ? getComputedStyle(menu).display : "missing";
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const h1Count = document.querySelectorAll("h1").length;
    const menuBox = menu ? JSON.parse(JSON.stringify(menu.getBoundingClientRect())) : null;
    return { menuDisplay, overflow, h1Count, menuBox };
  });

  const menuVisible = width < 768 ? report.menuDisplay !== "none" : report.menuDisplay === "none";
  const overflowOk = report.overflow <= 0;
  if (!menuVisible || !overflowOk || report.h1Count !== 1) failures += 1;

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
