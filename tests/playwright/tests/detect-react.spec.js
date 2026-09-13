const { test, expect } = require('@playwright/test');
const selectors = require('../utils/selectors');

test.describe('React Detect panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
    await page.locator(selectors.reactNavDetect).click();
  });

  test('shows the Detect tab and panel', async ({ page }) => {
    await expect(page.locator(selectors.reactNavDetect)).toBeVisible();
    await expect(page.locator(selectors.reactPanelDetect)).toBeVisible();
  });

  test('defaults to the File sub-tab', async ({ page }) => {
    await expect(page.locator(selectors.reactDetectPaneFile)).toBeVisible();
    await expect(page.locator(selectors.reactDetectBtn)).toBeVisible();
    await expect(page.locator(selectors.reactDetectBtn)).toBeDisabled();
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

  test('switches to the Live Stream sub-tab and shows the WS connect control', async ({ page }) => {
    await page.locator(selectors.reactDetectTabLive).click();
    await expect(page.locator(selectors.reactDetectPaneLive)).toBeVisible();
    await expect(page.locator(selectors.reactDetectWsBtn)).toBeVisible();
    await expect(page.locator(selectors.reactDetectWsLabel)).toHaveText(/disconnected/i);
  });

  test('probes YOLO model availability when the Live Stream sub-tab opens', async ({ page }) => {
    await page.locator(selectors.reactDetectTabLive).click();
    // Resolves to one of the known states POST /yolo/detect's probe response maps to (see
    // DetectLiveStream's checkModel) — this just asserts the probe completed, not which model
    // is installed in this environment.
    await expect(page.locator(selectors.reactDetectModelLabel)).not.toHaveText(/checking/i, {
      timeout: 10000,
    });
  });

  test('connecting the live WebSocket flips the status label to connected', async ({ page }) => {
    await page.locator(selectors.reactDetectTabLive).click();
    await page.locator(selectors.reactDetectWsBtn).click();
    await expect(page.locator(selectors.reactDetectWsLabel)).toHaveText(/connected/i, { timeout: 10000 });
    await expect(page.locator(selectors.reactDetectWsBtn)).toHaveText(/disconnect/i);
  });
});
