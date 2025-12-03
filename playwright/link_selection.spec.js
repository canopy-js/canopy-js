import { test, expect } from './test-setup';
const { scrollElementToViewport } = require('./helpers');

const os = require('os');
let platform = os.platform();
let systemNewTabKey;
if (platform === 'darwin') {
  systemNewTabKey = 'Meta';
} else {
  systemNewTabKey = 'Control';
}

test.describe('Link Selection', () => {
  test('Link selection is remembered with browser history', async ({ page, browserName }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.goBack();
    await expect(page.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await page.goForward();
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New Jersey');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('url');
    await page.goBack();
    await expect(page.locator('.canopy-selected-link')).toHaveText('New Jersey');
    await page.goForward();
    await expect(page.locator('.canopy-selected-link')).toHaveText('url');
  });

  test('Link selection persists over refresh', async ({ page, browserName }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
  });

  test('Link deselection persists over refresh', async ({ page, browserName }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('Escape');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
  });

  test('Subtopics from previous renders are accessible', async ({ page, browserName }) => { // cached subtopics can be recalled by fetchAndRenderPath
    await page.goto('/United_States/New_Jersey'); // load New_Jersey#Northern_border and cache it
    await expect(page).toHaveURL("/United_States/New_Jersey");

    await page.goto('/United_States/New_Jersey#Northern_border/New_York#Southern_border'); // load New_Jersey#Northern_border from cache as parent for New_York
    await expect(page).toHaveURL("/United_States/New_Jersey#Northern_border/New_York#Southern_border");
  });

  test('Last link selections are preferred when going down', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style examples');
    await expect(page.locator('.canopy-selected-section > p')).toContainText('These are some style examples.'); // prevent advance before scroll

    await scrollElementToViewport(page, '.canopy-selected-link');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('multi-line tokens');

    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style examples');

    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveText('style examples');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('multi-line tokens');
  });
});
