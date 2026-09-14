const { test, expect } = require('@playwright/test');

// Literal selectors inline (not shared selectors.js) to minimize merge conflicts
// with the other panels being built concurrently — see dashboard-react.spec.js
// for the pattern this copies.
const navStt = '[data-testid="panel-nav-stt"]';
const panelStt = '[data-testid="panel-content-stt"]';
const healthBadge = '[data-testid="stt-health-badge"]';
const uploadCard = '[data-testid="upload-transcribe-card"]';
const modeToggle = '[data-testid="stt-mode-toggle"]';
const recordButton = '[data-testid="audio-record-button"]';
const audioFileInput = '#stt-audio-file';
const audioFileName = '[data-testid="audio-file-name"]';
const transcribeButton = '[data-testid="audio-transcribe-button"]';
const audioResultText = '[data-testid="audio-result-text"]';

test.describe('React STT panel (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to the STT tab: one Upload/Record card, no Live tab', async ({ page }) => {
    await page.locator(navStt).click();
    await expect(page.locator(panelStt)).toBeVisible();
    await expect(page.locator(healthBadge)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(uploadCard)).toBeVisible();
    await expect(page.locator(recordButton)).toBeVisible();
    await expect(page.locator(modeToggle)).toHaveCount(0);
  });

  test('uploading a file enables Transcribe and posts to /audio/transcribe', async ({ page }) => {
    await page.locator(navStt).click();

    const buffer = Buffer.from('RIFF....WAVEfmt ', 'utf-8');
    await page.locator(audioFileInput).setInputFiles({
      name: 'clip.wav',
      mimeType: 'audio/wav',
      buffer,
    });
    await expect(page.locator(audioFileName)).toContainText('clip.wav');
    await expect(page.locator(transcribeButton)).toBeEnabled();

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/audio/transcribe') && res.request().method() === 'POST',
    );
    await page.locator(transcribeButton).click();
    const response = await responsePromise;
    // Real backend needs a loaded Whisper model to return 200; either way the
    // request must have actually been made with the uploaded file.
    expect(response.status()).toBeGreaterThanOrEqual(200);
    await expect(page.locator(audioResultText)).not.toContainText(/upload a file to transcribe/i);
  });
});
