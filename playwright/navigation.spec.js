// @ts-check
const { test, expect } = require('@playwright/test');


test.beforeEach(async ({ page }) => {
  await page.goto('localhost:3000');

  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(message.text());
    }
  })
});


test.describe('Navigation', () => {
  test('Selecting a global link previews child paragraph', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border.')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey.')).toHaveCount(1);
  });

  test('Selecting import reference previews path', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York.')).toHaveCount(1);
  });

  test('Pressing down on global link advances path', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey.')).toHaveCount(1);
  });

  test('Pressing enter on global redirects to new page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('New_York#Southern_border'); // Link selected on redirect
    await expect(page.locator('h1')).toHaveText('New York');
  });

  test('Meta-enter on global link opens new tab to redirected path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press('Meta+Enter')
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(newPage).toHaveURL('New_York');
  });

  test('Clicking on global inlines link', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');

    await page.locator('text=New York').click()

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Alt-clicking on global redirects the page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('text=New York').click({
      modifiers: ['Alt']
    });
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('New_York'); // Link selected on redirect
    await expect(page.locator('h1')).toHaveText('New York');
  });

  test('Meta-clicking on open global opens new tab to inlined path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New York")').click({
        modifiers: ['Meta']
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(newPage).toHaveURL('United_States/New_York');
  });

  test('Meta-clicking on closed global opens new tab to inlined path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New Jersey")').click({
        modifiers: ['Meta']
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('New Jersey');
    await expect(newPage).toHaveURL('United_States/New_Jersey');
  });

  test('Meta-alt-clicking on global link opens new tab to redirected path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New York")').click({
        modifiers: ['Meta', 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(newPage).toHaveURL('New_York');
  });

  test('Pressing down on local link advances path and previews child paragraph', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York.')).toHaveCount(1);
  });

  test('Pressing enter on local link advances path', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York.')).toHaveCount(1);
  });

  test('Pressing Alt+enter on local zooms on selected path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('Alt+Enter')

    await expect(page.locator('h1')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('New_York#Southern_border');
  });

  test('Pressing Meta+enter on local redirects to new tab with same path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press('Meta+Enter')
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Pressing alt-meta-enter on local zooms to lowest path segment', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press('Alt+Meta+Enter')
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('New_York#Southern_border');
  });

  test('Clicking on local inlines link', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('text=New York').click()
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('a:has-text("southern border")').click()
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Alt-clicking on local zooms to the lowest path segment', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('text=New York').click()
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('a:has-text("southern border")').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('New_York#Southern_border');
  });

  test('Meta-clicking on local opens new tab to that path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border")').click({
        modifiers: ['Meta']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Meta-option-clicking on local opens new tab to the zoomed path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border")').click({
        modifiers: ['Meta', 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('New_York#Southern_border');
  });

  test('Down on import reference selects target', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // import reference
    await page.locator('body').press('ArrowDown'); // skips a level
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    // When an import reference is navigated to inline, both the parent global link and the import link should be "open"
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")', { has: page.locator('a:text("northern border").canopy-open-link')})).toHaveCount(1);
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")', { has: page.locator('a:text("New Jersey").canopy-open-link')})).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Attractions');

    // Now that we have navigated away from the import path, only the global parent link should be open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")', { has: page.locator('a:text("northern border").canopy-open-link')})).toHaveCount(0);
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")', { has: page.locator('a:text("New Jersey").canopy-open-link')})).toHaveCount(1);
  });

  test('Enter on import reference redirects to target', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // import reference

    await page.locator('body').press('Enter');

    await expect(page.locator('h1')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('New_Jersey#Northern_border');
  });

  test('Clicking on an import inlines the import path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');

    await page.locator('a:has-text("northern border")').click()

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');

    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("northern border").canopy-open-link.canopy-selected-link')})).toHaveCount(1);
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("New Jersey").canopy-open-link')})).toHaveCount(1);

    await expect(page.locator('body')).toContainText('The northern border of New Jersey abuts the southern border of New York.');
  });

  test('Alt-clicking on an import redirects to the import path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');

    await page.locator('a:has-text("northern border")').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-clicking on an import opens to the import path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border")').click({
        modifiers: ['Meta']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');
  });

  test('Meta-alt-clicking on an import opens to the import path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border")').click({
        modifiers: ['Meta', 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New Jersey');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-enter on an import opens to the import path', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press('Meta+Enter')
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New Jersey');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('New_Jersey#Northern_border');
  });

  test('Pressing z zooms to lowest path segment', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await page.locator('text=The state of New York has a southern border.').press('ArrowDown');
    await page.locator('text=The southern border of New York abuts the northern border of New Jersey.').press('z');
    await expect(page).toHaveURL('/New_York#Southern_border');
    await expect(page.locator('h1')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
  });

  test('Pressing shift-up goes to previous topic', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('Shift+ArrowUp');

    await expect(page).toHaveURL('United_States/New_York');
    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('body').press('Shift+ArrowUp'); // no-op

    await expect(page).toHaveURL('United_States/New_York');
    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
  });

  test('Pressing tab goes through local references in DFS', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New Jersey');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');

    await page.locator('body').press('Tab');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await page.locator('body').press('Tab');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Tab');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('Tab');
    await expect(page.locator('.canopy-selected-link')).toHaveText('attractions');
    await page.locator('body').press('Tab');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern part');
    await page.locator('body').press('Tab');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');
  });

  test('Link selection is remembered with browser history', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New Jersey');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('url');
    await page.goBack();
    await page.goForward();
    await expect(page.locator('.canopy-selected-link')).toHaveText('url');
  });

  test('Link selection persists over refresh', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
  });
});
