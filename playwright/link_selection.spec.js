const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.on("console", logBrowserErrors);
});

function logBrowserErrors(message) {
  if (message.type() === "error") {
    console.error(message.text());
  }
}

const os = require('os');
let platform = os.platform();
let systemNewTabKey;
if (platform === 'darwin') {
  systemNewTabKey = 'Meta';
} else {
  systemNewTabKey = 'Control';
}

test.describe('Link Selection', () => {
  test('Link selection is remembered with browser history', async ({ page }) => {
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

  test('Link selection persists over refresh', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
  });

  test('Link deselection persists over refresh', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('Escape');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
  });

  test('Last link selections are preferred when going down', async ({ page }) => {
    await page.goto('/United_States/New_York');
    page.setViewportSize({ width: 2000, height: 1000 });
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowRight');
    // make sure the entire displayPath render is done before advancing
    await expect(page.locator('.canopy-selected-section')).toContainText("Martha's Vineyard is a an Island in Massachusetts.");
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText("New York");
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText("New York");
    await page.reload(); // persists even across reload
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
  });
});
