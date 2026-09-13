/**
 * Endpoints panel UI tests — the "API Reference" panel now embeds Scalar
 * (github.com/scalar/scalar), the open-source OpenAPI reference UI, reading
 * the spec from GET /openapi.json and the standalone bundle from the
 * self-hosted GET /assets/scalar.js (see src/api/assets.rs::fetch_scalar()).
 *
 * Scalar owns its own internal DOM (mounted into #scalar-api-reference), so
 * these tests check observable outcomes rather than any specific internal
 * markup: the panel activates, /openapi.json is fetched successfully, the
 * mount point ends up non-empty, and no console errors are thrown while it
 * loads.
 */
const { test, expect } = require('@playwright/test');
const S = require('../utils/selectors');

test.describe('Endpoints panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  test.describe('navigation', () => {
    test('Endpoints nav item becomes active', async ({ page }) => {
      await page.locator(S.navEndpoints).click();
      await expect(page.locator(S.navEndpoints)).toHaveClass(/active/);
    });

    test('only one panel is active', async ({ page }) => {
      await page.locator(S.navEndpoints).click();
      await expect(page.locator('.panel.active')).toHaveCount(1);
    });

    test('switching away hides Endpoints panel', async ({ page }) => {
      await page.locator(S.navEndpoints).click();
      await page.locator(S.navStatus).click();
      await expect(page.locator(S.panelEndpoints)).not.toHaveClass(/active/);
    });
  });

  // ── OpenAPI spec ─────────────────────────────────────────────────────────

  test.describe('OpenAPI spec', () => {
    test('GET /openapi.json responds with a valid spec', async ({ request }) => {
      const resp = await request.get('/openapi.json');
      expect(resp.status()).toBe(200);
      expect(resp.headers()['content-type']).toContain('application/json');
      const body = await resp.json();
      expect(body.openapi).toMatch(/^3\./);
      expect(Object.keys(body.paths).length).toBeGreaterThanOrEqual(10);
    });

    test('visiting the panel triggers a successful /openapi.json request', async ({ page }) => {
      const specRequest = page.waitForResponse(
        (resp) => resp.url().includes('/openapi.json') && resp.status() === 200
      );
      await page.locator(S.navEndpoints).click();
      const resp = await specRequest;
      expect(resp.ok()).toBeTruthy();
    });
  });

  // ── Scalar reference embed ──────────────────────────────────────────────

  test.describe('Scalar reference embed', () => {
    test('panel has a visible title', async ({ page }) => {
      await page.locator(S.navEndpoints).click();
      await expect(page.locator(`${S.panelEndpoints} .panel-title`)).toBeVisible();
    });

    test('Scalar bundle loads and exposes window.Scalar', async ({ page }) => {
      await page.locator(S.navEndpoints).click();
      await page.waitForFunction(() => !!(window.Scalar && window.Scalar.createApiReference), null, {
        timeout: 15000,
      });
      const hasScalar = await page.evaluate(() => typeof window.Scalar?.createApiReference === 'function');
      expect(hasScalar).toBe(true);
    });

    test('mount point is populated with the rendered reference', async ({ page }) => {
      await page.locator(S.navEndpoints).click();
      const mount = page.locator('#scalar-api-reference');
      await expect(mount).toBeVisible();
      // Scalar mounts a non-trivial subtree once the spec has loaded — an
      // empty div means the embed silently failed.
      await expect
        .poll(async () => (await mount.locator('*').count()) > 5, { timeout: 15000 })
        .toBe(true);
    });

    test('at least one known route path from the spec is rendered somewhere in the panel', async ({ page }) => {
      await page.locator(S.navEndpoints).click();
      await expect
        .poll(async () => page.locator(`${S.panelEndpoints}:has-text("/tts/stream")`).count(), {
          timeout: 15000,
        })
        .toBeGreaterThan(0);
    });

    test('no console errors while the panel loads', async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await page.locator(S.navEndpoints).click();
      await expect
        .poll(async () => (await page.locator('#scalar-api-reference *').count()) > 5, {
          timeout: 15000,
        })
        .toBe(true);
      expect(errors, `console/page errors: ${JSON.stringify(errors)}`).toEqual([]);
    });
  });
});
