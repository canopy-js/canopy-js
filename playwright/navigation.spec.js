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
    await expect(page.locator('text=The state of New York has a southern border')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey.')).toHaveCount(1);
  });

  test('It renders properly when page is initialized to a multi-segment path', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States'); // wait for original page, or outstanding requests will error
    let response = await page.goto('United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border'); //no redirects
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

    await page.locator('text=New York').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global deselects', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("New York")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('United_States');
  });

  test('Clicking on an open global selects it', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');

    await page.locator('a:has-text("New York")').click();

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

  test('Clicking on a selected local deselects', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("southern border")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on an open local selects it', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    await page.locator('a[data-type="local"]:has-text("southern border")').click();

    await expect(page.locator('h1')).toHaveText('United States');
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
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("northern border").canopy-open-link')})).toHaveCount(1);
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("New Jersey").canopy-open-link')})).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Attractions');

    // Now that we have navigated away from the import path, only the global parent link should be open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("northern border").canopy-open-link')})).toHaveCount(0);
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("New Jersey").canopy-open-link')})).toHaveCount(1);
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
    await page.locator('text=The state of New York has a southern border').press('ArrowDown');
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
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.goBack();
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await page.goForward();
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
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
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
  });

  test('it renders everything properly for topics with single quotation marks', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard");

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator(`text="Martha's Vineyard"`).click({
        modifiers: ['Meta']
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard");
    await expect(newPage.locator(`text=Martha's Vineyard is a an Island in Massachusetts`)).toHaveCount(1);
  });

  test('it renders everything properly for topics with double quotation marks', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard");
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/The_word_\"vinyard\"");
    await expect(page.locator('text=This is a word in English')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('text=the word "vinyard"').click({
        modifiers: ['Meta']
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');
    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/The_word_\"vinyard\"");
    await expect(newPage.locator('text=This is a word in English')).toHaveCount(1);
  });

  test('it renders everything properly for topics with pound signs marks', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard");
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 gift shop");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/The_world's_%231_gift_shop");
    await expect(page.locator('text=This is a great gift shop')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=the world's #1 gift shop").click({
        modifiers: ['Meta']
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("the world's #1 gift shop");
    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/The_world's_%231_gift_shop");
    await expect(newPage.locator('text=This is a great gift shop')).toHaveCount(1);
  });

  test('it renders everything properly for topics with question marks', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard");
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 gift shop");
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 keychains");
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("What attractions are nearby Martha's Vineyard?");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/What_attractions_are_nearby_Martha's_Vineyard?");
    await expect(page.locator('text=There are a lot of them.')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=What attractions are nearby Martha's Vineyard?").click({
        modifiers: ['Meta']
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("What attractions are nearby Martha's Vineyard?");
    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/What_attractions_are_nearby_Martha's_Vineyard?");
    await expect(newPage.locator('text=There are a lot of them.')).toHaveCount(1);
  });

  test('it renders everything properly for topics with colons', async ({ page, context }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard");
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 gift shop");
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 keychains");
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("What attractions are nearby Martha's Vineyard?");
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history");
    await expect(page.locator('text=This is a good book.')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=Martha's Vineyard: a history").click({
        modifiers: ['Meta']
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");
    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history");
    await expect(newPage.locator('text=This is a good book.')).toHaveCount(1);
  });

  test('Browser back to empty path redirects to default topic', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page).toHaveURL('United_States');
    await page.goto('/');
    await expect(page).toHaveURL('United_States');
    await page.goBack();
    await expect(page).toHaveURL('United_States');
  });
});
