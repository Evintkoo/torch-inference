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

  test('renders a single merged Speak card, connecting automatically', async ({ page }) => {
    const panel = page.locator(panelTts);
    await expect(panel.getByText('Speak')).toBeVisible();
    // No manual "Connect" step — the WS status label resolves on its own.
    await expect(page.locator('[data-testid="tts-ws-status-label"]')).toHaveText('connected', {
      timeout: 10000,
    });
  });

  test('disables Speak until text is entered', async ({ page }) => {
    await expect(page.locator('[data-testid="tts-ws-status-label"]')).toHaveText('connected', { timeout: 10000 });
    const btn = page.locator('[data-testid="tts-ws-speak-btn"]');
    await expect(btn).toBeDisabled();
    await page.locator('[data-testid="tts-ws-text-input"]').fill('Hello from Playwright');
    await expect(btn).toBeEnabled();
  });
});
