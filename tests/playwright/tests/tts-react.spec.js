const { test, expect } = require('@playwright/test');

// Literal `[data-testid]` selectors inline here (rather than shared
// utils/selectors.js) to avoid merge conflicts with the other panels being
// built concurrently — panel-nav-*/panel-content-* testids come for free
// from AppLayout (see web/src/app/layout.tsx) for any panel id.
const navTts = '[data-testid="panel-nav-tts"]';
const panelTts = '[data-testid="panel-content-tts"]';

test.describe('React TTS panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
    await page.locator(navTts).click();
  });

  test('shows the TTS tab and panel content', async ({ page }) => {
    await expect(page.locator(navTts)).toBeVisible();
    await expect(page.locator(panelTts)).toBeVisible();
  });

  test('renders the Live TTS Stream and REST Synthesis cards', async ({ page }) => {
    const panel = page.locator(panelTts);
    await expect(panel.getByText('Live TTS Stream')).toBeVisible();
    await expect(panel.getByText('REST Synthesis')).toBeVisible();
  });

  test('disables Synthesise until text is entered', async ({ page }) => {
    const btn = page.locator('[data-testid="tts-synthesize-btn"]');
    await expect(btn).toBeDisabled();
    await page.locator('[data-testid="tts-text-input"]').fill('Hello from Playwright');
    await expect(btn).toBeEnabled();
  });

  test('streams /tts/stream and plays back a synthesised WAV', async ({ page }) => {
    // 4 bytes of PCM16-LE (two int16 samples) is enough to exercise the
    // streaming -> WAV-wrap -> <audio src> path without needing a real
    // TTS engine loaded in the test environment.
    await page.route('**/tts/stream', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'audio/pcm',
        body: Buffer.from([0x00, 0x01, 0x00, 0x02]),
      });
    });

    await page.locator('[data-testid="tts-text-input"]').fill('Hello from Playwright');
    await page.locator('[data-testid="tts-synthesize-btn"]').click();

    await expect(page.locator('[data-testid="tts-status"]')).toContainText('Playing', { timeout: 10000 });
    await expect(page.locator('[data-testid="tts-audio"]')).toHaveAttribute('src', /^blob:/);
  });

  test('surfaces a friendly message when no TTS engine is loaded', async ({ page }) => {
    await page.route('**/tts/stream', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'No TTS engine available' }),
      });
    });

    await page.locator('[data-testid="tts-text-input"]').fill('Hello');
    await page.locator('[data-testid="tts-synthesize-btn"]').click();

    await expect(page.locator('[data-testid="tts-status"]')).toContainText('No TTS engine loaded', {
      timeout: 10000,
    });
  });

  test('Live TTS Stream Connect button toggles the status label', async ({ page }) => {
    const connectBtn = page.locator('[data-testid="tts-ws-connect-btn"]');
    await expect(page.locator('[data-testid="tts-ws-status-label"]')).toHaveText('disconnected');
    await connectBtn.click();
    await expect(page.locator('[data-testid="tts-ws-status-label"]')).toHaveText('connected', { timeout: 10000 });
    await expect(connectBtn).toHaveText('Disconnect');
  });
});
