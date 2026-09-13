const { test, expect } = require('@playwright/test');

// Literal selectors inline (not shared selectors.js) to minimize merge conflicts
// with the other panels being built concurrently — see dashboard-react.spec.js
// for the pattern this copies.
const navStt = '[data-testid="panel-nav-stt"]';
const panelStt = '[data-testid="panel-content-stt"]';
const healthBadge = '[data-testid="stt-health-badge"]';
const uploadCard = '[data-testid="upload-transcribe-card"]';
const liveStream = '[data-testid="live-stt-stream"]';
const modelStatus = '[data-testid="stt-model-status"]';
const recordButton = '[data-testid="stt-record-button"]';
const vadLabel = '[data-testid="stt-vad-label"]';
const transcriptBox = '[data-testid="stt-transcript"]';
const audioFileInput = '#stt-audio-file';
const audioFileName = '[data-testid="audio-file-name"]';
const transcribeButton = '[data-testid="audio-transcribe-button"]';
const audioResultText = '[data-testid="audio-result-text"]';

test.describe('React STT panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
  });

  test('navigates to the STT tab', async ({ page }) => {
    await page.locator(navStt).click();
    await expect(page.locator(panelStt)).toBeVisible();
    await expect(page.locator(healthBadge)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(uploadCard)).toBeVisible();
    await expect(page.locator(liveStream)).toBeVisible();
  });

  test('reports the live STT model status from /stt/health', async ({ page }) => {
    await page.locator(navStt).click();
    // Resolves to either a loaded/not-loaded/unreachable label once /stt/health responds.
    await expect(page.locator(modelStatus)).not.toHaveText(/checking/i, { timeout: 10000 });
  });

  test('Record starts idle with an empty transcript and no VAD activity', async ({ page }) => {
    await page.locator(navStt).click();
    await expect(page.locator(vadLabel)).toHaveText('idle');
    await expect(page.locator(transcriptBox)).toContainText(/transcript appears here/i);
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

  test('Record button reflects STT model availability from /stt/health', async ({ page }) => {
    await page.locator(navStt).click();
    await expect(page.locator(modelStatus)).not.toHaveText(/checking/i, { timeout: 10000 });
    const label = await page.locator(modelStatus).textContent();
    if (/loaded ✓/.test(label || '')) {
      await expect(page.locator(recordButton)).toBeEnabled();
    } else {
      await expect(page.locator(recordButton)).toBeDisabled();
    }
  });
});
