const { test, expect } = require('@playwright/test');

// Literal selectors inline (per the migration brief) rather than adding to
// the shared selectors.js, to minimize merge conflicts with the other panels
// being built concurrently in sibling worktrees.
const navApiReference = '[data-testid="panel-nav-api-reference"]';
const panelApiReference = '[data-testid="panel-content-api-reference"]';
const scalarMount = '[data-testid="api-reference-mount"]';

test.describe('React API Reference panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
  });

  test('navigates to the API Reference tab and shows its panel', async ({ page }) => {
    await page.locator(navApiReference).click();
    await expect(page.locator(navApiReference)).toHaveAttribute('data-state', 'active');
    await expect(page.locator(panelApiReference)).toBeVisible();
    await expect(page.locator(panelApiReference)).toContainText('API Reference');
    await expect(page.locator(panelApiReference)).toContainText('/openapi.json');
  });

  test('mounts the self-hosted Scalar bundle and renders the OpenAPI spec', async ({ page }) => {
    await page.locator(navApiReference).click();
    const mount = page.locator(scalarMount);
    await expect(mount).toBeVisible();
    // Scalar renders the spec's `info.title` into an <h1> inside its mount
    // once /assets/scalar.js has loaded and fetched /openapi.json — give it
    // real time since this is a ~1MB self-hosted bundle plus a fetch, not a
    // stubbed response.
    await expect(mount.locator('h1').first()).toBeVisible({ timeout: 15000 });
  });

  test('serves the vendored Scalar bundle and the OpenAPI spec directly', async ({ page, request }) => {
    const scalarJs = await request.get('/assets/scalar.js');
    expect(scalarJs.ok()).toBeTruthy();
    expect(scalarJs.headers()['content-type']).toContain('javascript');

    const spec = await request.get('/openapi.json');
    expect(spec.ok()).toBeTruthy();
    const body = await spec.json();
    expect(body.openapi).toBeTruthy();
    expect(Object.keys(body.paths || {}).length).toBeGreaterThan(0);
  });
});
