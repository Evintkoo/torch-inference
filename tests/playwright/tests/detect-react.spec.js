const { test, expect } = require('@playwright/test');
const selectors = require('../utils/selectors');

test.describe('React Detect panel (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator(selectors.reactNavDetect).click();
  });

  test('shows the Detect tab and panel — single view, no Live Stream sub-tab', async ({ page }) => {
    await expect(page.locator(selectors.reactNavDetect)).toBeVisible();
    await expect(page.locator(selectors.reactPanelDetect)).toBeVisible();
    await expect(page.locator(selectors.reactDetectBtn)).toBeVisible();
    await expect(page.locator(selectors.reactDetectBtn)).toBeDisabled();
    await expect(page.locator(selectors.reactDetectCameraPhoto)).toBeVisible();
    await expect(page.locator(selectors.reactDetectCameraLive)).toBeVisible();
  });

  test('enables Detect once an image file is chosen', async ({ page }) => {
    await page.locator(selectors.reactDetectFileInput).setInputFiles({
      name: 'probe.png',
      mimeType: 'image/png',
      // 1x1 transparent PNG.
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    });
    await expect(page.locator(selectors.reactDetectBtn)).toBeEnabled();
  });
});
