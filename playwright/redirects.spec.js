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

test.describe('Redirects', () => {
  test('Empty path redirects to default topic', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page).toHaveURL('United_States');
    await page.goto('/');
    await expect(page).toHaveURL('United_States');
  });

  test('For an invalid topic in path it tries subpaths', async ({ page }) => {
    page.off("console", logBrowserErrors);
    let consoleLogs = [];

    page.on("console", (message) => {
      consoleLogs.push(`[${message.type()}] ${message.text()}`);
    });
    await page.goto('/United_States/New_York/Mars');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page).toHaveURL('United_States/New_York');
    await expect(consoleLogs).toContainEqual('[error] No section element found for path: /United_States/New_York/Mars');
    await expect(consoleLogs).toContainEqual('[log] Trying: /United_States/New_York');
  });

  test('For an invalid path topic adjacency it tries subpaths', async ({ page }) => {
    page.off("console", logBrowserErrors);
    let consoleLogs = [];

    page.on("console", (message) => {
      consoleLogs.push(`[${message.type()}] ${message.text()}`);
    })
    await page.goto('/United_States/New_York/New_Jersey'); // valid topic but no link from New York -> New Jersey
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page).toHaveURL('United_States/New_York');
    await expect(consoleLogs).toContainEqual('[error] No section element found for path: /United_States/New_York/New_Jersey');
    await expect(consoleLogs).toContainEqual('[log] Trying: /United_States/New_York');
  });

  test('For an invalid path subtopic adjacency it tries subpaths', async ({ page }) => { // if registered orphans, it would fail on addToDom's parentNode call
    page.off("console", logBrowserErrors);
    let consoleLogs = [];

    page.on("console", (message) => {
      consoleLogs.push(`[${message.type()}] ${message.text()}`);
    })
    await page.goto('/United_States/New_York#Southern_border/United_States'); // valid topic but no link from New_York#Southern_border -> New Jersey
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');
    await expect(consoleLogs).toContainEqual('[error] Parent element [New York, Southern border] has no connecting link to subsequent path segment [United States]');
    await expect(consoleLogs).toContainEqual('[error] No section element found for path: /United_States/New_York#Southern_border/United_States');
    await expect(consoleLogs).toContainEqual('[log] Trying: /United_States/New_York#Southern_border');
  });

  test('For an invalid single-element path it redirects to default topic', async ({ page }) => {
    page.off("console", logBrowserErrors);
    let consoleLogs = [];

    page.on("console", (message) => {
      consoleLogs.push(`[${message.type()}] ${message.text()}`);
    })
    await page.goto('/Mars');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page).toHaveURL('United_States');
    await expect(consoleLogs).toContainEqual('[error] No section element found for path: /Mars');
    await expect(consoleLogs).toContainEqual('[error] No path prefixes remain to try. Redirecting to default topic: /United_States');
  });
});
