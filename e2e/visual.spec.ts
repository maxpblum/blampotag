import { test, expect } from '@playwright/test';

test('has correct title', async ({ page }) => {
  await page.goto('/app/index.html');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Blampotag/);
});

test('game output is visible', async ({ page }) => {
  await page.goto('/app/index.html');

  // Check if the game output element is visible
  const gameOutput = page.locator('#game-output');
  await expect(gameOutput).toBeVisible();
});
