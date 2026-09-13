const { test, expect } = require('@playwright/test');

test.describe('React Chat panel (/preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview');
    await page.locator('[data-testid="panel-nav-chat"]').click();
  });

  test('shows the Chat tab and its panel content', async ({ page }) => {
    await expect(page.locator('[data-testid="panel-nav-chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-content-chat"]')).toBeVisible();
  });

  test('shows the welcome state before any message is sent', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-welcome"]')).toBeVisible();
  });

  test('sends a message and streams an assistant reply', async ({ page }) => {
    const input = page.locator('[data-testid="chat-input"]');
    await input.fill('Say hello in one word.');
    await page.locator('[data-testid="chat-send-btn"]').click();

    await expect(page.locator('[data-testid="chat-message-user"]').last()).toContainText(
      'Say hello in one word.',
    );
    // The LLM microservice may take 30-60s to load on first request (or may
    // not be running at all in CI) — assert the assistant bubble appears and
    // streaming eventually finishes (send button re-enables), not any
    // particular reply content.
    await expect(page.locator('[data-testid="chat-message-assistant"]').last()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('[data-testid="chat-send-btn"]')).toBeEnabled({ timeout: 90000 });
  });

  test('Enter sends the message; Shift+Enter inserts a newline', async ({ page }) => {
    const input = page.locator('[data-testid="chat-input"]');
    await input.fill('line one');
    await input.press('Shift+Enter');
    await input.type('line two');
    await expect(input).toHaveValue('line one\nline two');

    await input.press('Enter');
    await expect(page.locator('[data-testid="chat-message-user"]').last()).toContainText(
      'line one\nline two',
    );
    await expect(input).toHaveValue('');
  });

  test('toggles the settings panel exposing model/temperature/max-tokens controls', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-settings-panel"]')).not.toBeVisible();
    await page.locator('[data-testid="chat-settings-toggle"]').click();
    await expect(page.locator('[data-testid="chat-model-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-temperature-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-max-tokens-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-system-prompt-input"]')).toBeVisible();

    await page.locator('[data-testid="chat-settings-toggle"]').click();
    await expect(page.locator('[data-testid="chat-settings-panel"]')).not.toBeVisible();
  });

  test('New chat clears the thread back to the welcome state', async ({ page }) => {
    const input = page.locator('[data-testid="chat-input"]');
    await input.fill('hi');
    await page.locator('[data-testid="chat-send-btn"]').click();
    await expect(page.locator('[data-testid="chat-message-user"]').last()).toBeVisible();

    await page.locator('[data-testid="chat-new-btn"]').click();
    await expect(page.locator('[data-testid="chat-welcome"]')).toBeVisible();
  });
});
