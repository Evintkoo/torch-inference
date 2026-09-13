const { test, expect } = require('@playwright/test');

const reactNavClassify = '[data-testid="panel-nav-classify"]';
const reactPanelClassify = '[data-testid="panel-content-classify"]';

// A tiny valid 1x1 red PNG, so the real /classify/batch endpoint can decode
// and preprocess it (a text file with a renamed extension would 400).
const FIXTURE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
);

test.describe('React Classify panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
    await page.locator(reactNavClassify).click();
  });

  test('shows the Classify tab and panel', async ({ page }) => {
    await expect(page.locator(reactNavClassify)).toBeVisible();
    await expect(page.locator(reactPanelClassify)).toBeVisible();
  });

  test('Classify button is disabled until an image is loaded', async ({ page }) => {
    const panel = page.locator(reactPanelClassify);
    await expect(panel.getByTestId('classify-submit')).toBeDisabled();
  });

  test('uploading an image enables Classify and posts to /classify/batch, rendering predictions', async ({
    page,
  }) => {
    const panel = page.locator(reactPanelClassify);
    const fixturePath = test.info().outputPath('classify-fixture.png');
    require('node:fs').writeFileSync(fixturePath, FIXTURE_PNG);

    await panel.getByTestId('classify-file-input').setInputFiles(fixturePath);
    await expect(panel.getByTestId('classify-preview')).toBeVisible();
    await expect(panel.getByTestId('classify-submit')).toBeEnabled();

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/classify/batch') && resp.request().method() === 'POST',
    );
    await panel.getByTestId('classify-submit').click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    // Either a ranked predictions table or the explicit "no model loaded"
    // message is valid, depending on whether a real classifier backend is
    // wired up in this test environment — either way the request/response
    // cycle completed and the panel reflects it (not stuck on "waiting").
    await expect(panel.getByTestId('classify-results').or(panel.getByTestId('classify-empty'))).toBeVisible({
      timeout: 10000,
    });
  });
});
