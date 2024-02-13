const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.on("console", logBrowserErrors);

  await page.goto('/United_States');
  await expect(page).toHaveURL("United_States");
  await page.evaluate(() => localStorage.clear()); // get rid of old link selections
  await page.evaluate(() => sessionStorage.clear());
  await page.waitForFunction(() => {
    return localStorage.length === 0 && sessionStorage.length === 0;
  });
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

  test('Last link selections are preferred when going down', async ({ page, browserName }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-section')).toContainText("Martha's Vineyard is a an Island in Massachusetts."); // make sure the entire displayPath render is done before advancing
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await page.locator('body').press('ArrowUp');
    await page.waitForSelector('a:has-text("New York")', { state: 'visible' });
    const textAfterFirstPress = await page.locator('.canopy-selected-link').textContent(); // Check the text after the first press
    if (textAfterFirstPress !== "New York") await page.locator('body').press('ArrowUp'); // small screen might take two presses
    await expect(page.locator('.canopy-selected-link')).toHaveText("New York"); // Now, expect the text to be New York
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await page.locator('body').press('ArrowUp');
    await page.waitForSelector('a:has-text("New York")', { state: 'visible' });
    const textAfterFirstPress2 = await page.locator('.canopy-selected-link').textContent(); // Check the text after the first press
    if (textAfterFirstPress2 !== "New York") await page.locator('body').press('ArrowUp'); // small screen might take two presses
    const textAfterFirstPress3 = await page.locator('.canopy-selected-link').textContent(); // Check the text after the first press
    if (textAfterFirstPress3 !== "New York") await page.pause(); // small screen might take two presses
    await expect(page.locator('.canopy-selected-link')).toHaveText("New York");
    await page.reload(); // persists even across reload
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
  });
});
