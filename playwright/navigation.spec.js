// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('localhost:3000');
});

test.describe('Navigation', () => {
  test('Should have header', async ({ page }) => {
    await expect(page).toHaveURL('/United_States');
    await expect(page.locator('h1')).toHaveText('United States');
    // await page.screenshot({ path: 'test-results/first.png' });
  });

  test('Left and Right keys cause child paragraph preview', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border.')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('/United_States/New_Jersey');
    await expect(page.locator('text=The state of New Jersey has a northern border.')).toHaveCount(1);
  });

  test('Down on parent link advances path', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await page.locator('body').press('ArrowDown');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey.')).toHaveCount(1);
  });

  test('Selecting import reference previews path', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await page.locator('body').press('ArrowDown');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York.')).toHaveCount(1);
  });

  test('Pressing return on global redirects page', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await page.locator('body').press('ArrowDown');
    await page.locator('body').press('z');
    await expect(page).toHaveURL('/New_York#Southern_border'); // Link selected on redirect
    await expect(page.locator('h1')).toHaveText('New York');
  });

  test('Pressing z zooms to lowest path segment', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await page.locator('body').press('Enter');
    await expect(page).toHaveURL('/New_York#Southern_border');
    await expect(page.locator('h1')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
  });

  test('Down on import reference jumps to path', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await page.locator('body').press('ArrowDown');
    await page.locator('body').press('ArrowDown');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
  });

  test('Link selection is remembered with browser history', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await page.locator('body').press('ArrowDown');
    await page.locator('body').press('ArrowDown');
    await page.locator('body').press('ArrowRight');
    await page.locator('body').press('ArrowRight');
    await page.goBack();
    await page.goForward();
    await expect(page.locator('.canopy-selected-link')).toHaveText('url');
  });

  test('Link selection persists over refresh', async ({ page }) => {
    await page.locator('body').press('ArrowRight');
    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
  });
});
