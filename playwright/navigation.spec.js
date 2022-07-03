// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('localhost:3000');
});

test.describe('Open Page', () => {
  test('Should find container', async ({ page }) => {
    // Go to /United_States
    await page.goto('http://localhost:3000');
    await expect(page).toHaveURL('/United_States');
    // Click h1:has-text("United States")
    await expect(page.locator('h1')).toHaveText('United States');
    await page.screenshot({ path: 'test-results/first.png' });

    // Press ArrowRight
    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('/United_States/New_York');
    await expect(page.locator('text=The state of New York has a')).toHaveCount(1);
    await page.screenshot({ path: 'test-results/second.png' });

    // Press ArrowRight
    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('/United_States/New_Jersey');
    await expect(page.locator('text=The state of New Jersey has a')).toHaveCount(1);
    await page.screenshot({ path: 'test-results/third.png' });

  });
});
