import { test, expect } from '@playwright/test';

test('has correct title', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop-partial');
  await page.goto('/app/index.html');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Blampotag/);
});

test('game output is visible', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop-partial');
  await page.goto('/app/index.html');

  // Check if the game output element is visible
  const gameOutput = page.locator('#game-output');
  await expect(gameOutput).toBeVisible();
});

test('splash screen screenshot', async ({ page }) => {
  await page.goto('/app/index.html');

  // Assert screenshot of the entire page or a specific locator
  // We'll capture the game output element's screenshot.
  await expect(page.locator('#game-output')).toHaveScreenshot('splash-screen.png');
});
