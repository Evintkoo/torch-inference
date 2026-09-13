const { test, expect } = require('@playwright/test');
const S = require('../utils/selectors');

// Skipped: this tests the legacy playground.html's sidebar navigation
// (multi-panel nav), retired at cutover — the new React frontend currently
// has only one panel (Dashboard), so this nav-switching suite doesn't apply
// until more panels exist to navigate between.
test.describe.skip('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title contains Torch Inference Engine', async ({ page }) => {
    await expect(page).toHaveTitle(/Torch Inference Engine/);
  });

  test('sidebar renders 11 nav items', async ({ page }) => {
    await expect(page.locator('.nav-item')).toHaveCount(11);
  });

  test('Status is active and its panel visible by default', async ({ page }) => {
    await expect(page.locator(S.navStatus)).toHaveClass(/active/);
    await expect(page.locator(S.panelStatus)).toHaveClass(/active/);
  });

  test('clicking TTS shows TTS panel', async ({ page }) => {
    await page.locator(S.navTTS).click();
    await expect(page.locator(S.panelTTS)).toHaveClass(/active/);
    await expect(page.locator(S.navTTS)).toHaveClass(/active/);
  });

  test('clicking Classify shows Classify panel', async ({ page }) => {
    await page.locator(S.navClassify).click();
    await expect(page.locator(S.panelClassify)).toHaveClass(/active/);
  });

  test('clicking Assistant shows LLM panel', async ({ page }) => {
    await page.locator(S.navLLM).click();
    await expect(page.locator(S.panelLLM)).toHaveClass(/active/);
  });

  test('clicking Dashboard shows Dashboard panel', async ({ page }) => {
    await page.locator(S.navDashboard).click();
    await expect(page.locator(S.panelDashboard)).toHaveClass(/active/);
  });

  test('clicking Models shows Models panel', async ({ page }) => {
    if ((await page.locator(S.navModels).count()) === 0) { test.skip(true, 'Models panel not present in this build'); return; }
    await page.locator(S.navModels).click();
    await expect(page.locator(S.panelModels)).toHaveClass(/active/);
    await expect(page.locator(S.navModels)).toHaveClass(/active/);
  });

  test('clicking Endpoints shows Endpoints panel', async ({ page }) => {
    await page.locator(S.navEndpoints).click();
    await expect(page.locator(S.panelEndpoints)).toHaveClass(/active/);
  });

  test('only one panel is active at a time', async ({ page }) => {
    await page.locator(S.navTTS).click();
    await expect(page.locator('.panel.active')).toHaveCount(1);
    await page.locator(S.navClassify).click();
    await expect(page.locator('.panel.active')).toHaveCount(1);
  });

  test('only one nav item is active at a time', async ({ page }) => {
    await page.locator(S.navTTS).click();
    await expect(page.locator('.nav-item.active')).toHaveCount(1);
    await page.locator(S.navDashboard).click();
    await expect(page.locator('.nav-item.active')).toHaveCount(1);
  });

  test('Endpoints panel mounts the Scalar API reference', async ({ page }) => {
    await page.locator(S.navEndpoints).click();
    const mount = page.locator('#scalar-api-reference');
    await expect(mount).toBeVisible();
    await expect.poll(async () => (await mount.locator('*').count()) > 5, {
      timeout: 15000,
    }).toBe(true);
  });
});
