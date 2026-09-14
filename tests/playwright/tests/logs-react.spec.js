const { test, expect } = require('@playwright/test');

test.describe('React Logs panel (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to the Logs tab and shows a live tail — no file browser', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    await expect(page.locator('[data-testid="panel-content-logs"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Server Logs' })).toBeVisible();
    await expect(page.locator('[data-testid="logs-file-list"]')).toHaveCount(0);
  });

  test('auto-loads the current log file with no manual selection', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    // Starts on "Loading current log…" and resolves to the actual file name
    // once GET /logs + GET /logs/{file} both complete — never requires a click.
    await expect(page.locator('[data-testid="logs-viewer-header"]')).not.toHaveText(
      'Loading current log…',
      { timeout: 10000 },
    );
    await expect(page.locator('[data-testid="logs-viewer"] table')).toBeVisible();
  });

  test('the Live toggle is on by default', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    await expect(page.locator('[data-testid="logs-viewer-header"]')).not.toHaveText(
      'Loading current log…',
      { timeout: 10000 },
    );
    await expect(page.locator('[data-testid="logs-live-toggle"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('the search box filters rendered rows', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    await expect(page.locator('[data-testid="logs-viewer-header"]')).not.toHaveText(
      'Loading current log…',
      { timeout: 10000 },
    );

    const searchInput = page.locator('[data-testid="logs-search-input"]');
    await searchInput.fill('zzz_no_such_log_token_zzz');
    await expect(page.locator('[data-testid="logs-viewer"] table')).toContainText(
      /No rows match filter\.|No log lines\./,
    );
  });
});
