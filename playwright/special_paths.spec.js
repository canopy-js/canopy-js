const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(message.text());
    }
  })
});

test.describe('Special paths', () => {
  test('Project path prefix option creates path prefix', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States/New_York#Southern_border');
  });

  test('Hash URLs option creates hash prefix', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States/New_York#Southern_border');
  });

  test('Project path prefix option is compatible with hash option', async ({ page }) => {
    await page.goto('http://localhost:3003');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States/New_York#Southern_border');
  });
});
