const { test, expect } = require('@playwright/test');
const selectors = require('../utils/selectors');

test.describe('React System panel (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the Status tab selected by default', async ({ page }) => {
    await expect(page.locator(selectors.reactNavStatus)).toBeVisible();
    await expect(page.locator(selectors.reactPanelStatus)).toBeVisible();
  });

  test('renders system OS info fetched from /system/info', async ({ page }) => {
    const panel = page.locator(selectors.reactPanelStatus);
    // Note: `/system/info` reports `std::env::consts::OS`, which is "macos" on
    // macOS (never "darwin") — the brief's original regex only covered
    // "darwin|linux|windows" and would never match on this platform.
    await expect(panel).toContainText(/macos|darwin|linux|windows/i, { timeout: 10000 });
  });

  test('renders the live metrics chart once /dashboard/stream emits a sample', async ({ page }) => {
    await page.locator(selectors.reactNavMetrics).click();
    await expect(page.locator(selectors.reactMetricsChart)).toBeVisible({ timeout: 10000 });
  });
});
