const { test, expect } = require('@playwright/test');

test.describe('React Logs panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
  });

  test('navigates to the Logs tab and shows the file list panel', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    await expect(page.locator('[data-testid="panel-content-logs"]')).toBeVisible();
    await expect(page.locator('[data-testid="logs-file-list"]')).toBeVisible();
  });

  test('renders log files (or the empty state) fetched from GET /logs', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    const fileList = page.locator('[data-testid="logs-file-list"]');
    // Either at least one row of file metadata, or the explicit empty state —
    // both prove the /logs fetch completed and rendered instead of hanging.
    await expect(fileList).toContainText(/No log files found\.|MB/i, { timeout: 10000 });
  });

  test('viewer shows the placeholder state until a file is selected', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    await expect(page.locator('[data-testid="logs-viewer-header"]')).toHaveText('Select a file to view');
  });

  test('selecting a file loads its content into the log table', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    const fileList = page.locator('[data-testid="logs-file-list"]');
    const viewButton = fileList.getByRole('button', { name: 'View' }).first();

    // Only proceed if the server actually has a log file to view — a bare
    // "no log files found" environment has nothing to assert here.
    const hasFiles = (await viewButton.count()) > 0;
    test.skip(!hasFiles, 'No log files present on this server to select.');

    await viewButton.click();
    await expect(page.locator('[data-testid="logs-viewer-header"]')).not.toHaveText(
      'Select a file to view',
      { timeout: 10000 },
    );
    await expect(page.locator('[data-testid="logs-viewer"] table')).toBeVisible();
  });

  test('the search box filters rendered rows', async ({ page }) => {
    await page.locator('[data-testid="panel-nav-logs"]').click();
    const fileList = page.locator('[data-testid="logs-file-list"]');
    const viewButton = fileList.getByRole('button', { name: 'View' }).first();
    const hasFiles = (await viewButton.count()) > 0;
    test.skip(!hasFiles, 'No log files present on this server to select.');

    await viewButton.click();
    await expect(page.locator('[data-testid="logs-viewer-header"]')).not.toHaveText(
      'Select a file to view',
      { timeout: 10000 },
    );

    const searchInput = page.locator('[data-testid="logs-search-input"]');
    await searchInput.fill('zzz_no_such_log_token_zzz');
    await expect(page.locator('[data-testid="logs-viewer"] table')).toContainText(
      /No rows match filter\.|No log lines\./,
    );
  });
});
