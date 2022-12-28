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

test.describe('Navigation', () => {
  test('Selecting a global or local link previews child paragraph', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('United States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);
  });

  test('It renders properly when page is initialized to a multi-segment path', async ({ page }) => {
    await page.goto('United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border'); //no redirects
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Pressing down on global link advances path', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);
  });

  test('Pressing enter on global redirects to new path', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('New_York'); // No link selected on redirect
    await expect(page.locator('h1')).toHaveText('New York');
  });

  test('Meta-enter on global link opens new tab to redirected path', async ({ page, context, browserName }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.keyboard.press(`${systemNewTabKey}+Enter`)
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(newPage).toHaveURL('New_York');
  });

  test('Meta-Alt-Enter on global link opens new tab to redirected path', async ({ page, context, browserName }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.keyboard.press(`${systemNewTabKey}+Alt+Enter`)
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(newPage).toHaveURL('New_York');
  });

  test('Clicking on global inlines link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('United States');

    await page.locator('text=New York').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global deselects', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("New York")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(page).toHaveURL('United_States');
  });

  test('Clicking on an open global selects it', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("New York")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global selects parent', async ({ page }) => {
    await page.goto('United_States/New_York/Martha\'s_Vineyard');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Martha\'s Vineyard');

    await page.locator('section[data-subtopic-name="New York"][data-path-depth="1"] > p > a[data-type="global"]:has-text("Martha\'s Vineyard")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global in root paragraph deselects all', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a[data-type="global"]:has-text("New York")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('United_States');
  });
  test('Alt-clicking on global redirects the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('United States');

    await page.locator('text=New York').click({
      modifiers: ['Alt']
    });
    await expect(page.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(page).toHaveURL('New_York'); // Link selected on redirect
    await expect(page.locator('h1')).toHaveText('New York');
  });

  test('Meta-clicking on open global opens new tab to inlined path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New York")').click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(newPage).toHaveURL('United_States/New_York');
  });

  test('Meta-clicking on closed global opens new tab to inlined path', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('United States');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New Jersey")').click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('New Jersey');
    await expect(newPage).toHaveURL('United_States/New_Jersey');
  });

  test('Meta-alt-clicking on global link opens new tab to redirected path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New York")').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(newPage).toHaveURL('New_York');
  });

  test('Pressing down on local link advances path', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('ArrowDown');

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Pressing enter on local link advances path', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Pressing meta-enter on local zooms to lowest path segment', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press(`${systemNewTabKey}+Enter`)
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('New_York#Southern_border');
  });

  test('Clicking on local inlines link', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("southern border")').click();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Clicking on a selected local deselects', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("southern border")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on an open local selects it', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    await page.locator('a[data-type="local"]:has-text("southern border")').click();

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Clicking on a selected local selects parent', async ({ page }) => {
    await page.goto('New_Jersey#Attractions');
    await expect(page.locator('.canopy-selected-link')).toHaveText('attractions');

    await page.locator('a[data-type="local"]:has-text("attractions")').click();

    await expect(page.locator('h1')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');
    await expect(page).toHaveURL('New_Jersey#Northern_part');
  });

  test('Clicking on a selected local in root paragraph deselects all', async ({ page }) => {
    await page.goto('New_Jersey#Northern_part');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');

    await page.locator('a[data-type="local"]:has-text("northern part")').click();

    await expect(page.locator('h1')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('New_Jersey');
  });

  test('Alt-clicking on local zooms to the lowest path segment', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("southern border")').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('New_York#Southern_border');
  });

  test('Meta-clicking on local opens new tab to that path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border")').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Meta-option-clicking on local opens new tab to the zoomed path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border")').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('New_York#Southern_border');
  });

  test('Selecting import reference previews path', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('ArrowDown');

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Down on import reference selects target', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // import reference

    await page.locator('body').press('ArrowDown'); // skips a level

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    // When an import reference is navigated to inline, both the parent global link and the import link should be "open"
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("northern border").canopy-open-link >> visible=true')})).toHaveCount(1);
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("New Jersey").canopy-open-link >> visible=true')})).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Attractions');

    // Now that we have navigated away from the import path, only the global parent link should be open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("northern border").canopy-open-link >> visible=true')})).toHaveCount(0);
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("New Jersey").canopy-open-link >> visible=true')})).toHaveCount(1);
  });

  test('Enter on import reference redirects to target', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // import reference

    await page.locator('body').press('Enter');

    await expect(page.locator('h1')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('New_Jersey#Northern_border');
  });

  test('Clicking on an import inlines the import path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("northern border")').click()

    await expect(page.locator('h1')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');

    // The import reference should be selected and open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("northern border").canopy-open-link.canopy-selected-link >> visible=true')})).toHaveCount(1);

    // The global reference should be open but not selected
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("New Jersey").canopy-open-link >> visible=true')})).toHaveCount(1);

    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:text("New Jersey").canopy-open-link.canopy-selected-link >> visible=true')})).toHaveCount(0);

    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Alt-clicking on an import redirects to the import path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("northern border")').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-clicking on an import opens to the import path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border")').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');
  });

  test('Meta-alt-clicking on an import opens to the import path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border")').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New Jersey');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-enter on an import opens to the import path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press(`${systemNewTabKey}+Enter`)
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1')).toHaveText('New Jersey');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('New_Jersey#Northern_border');
  });

  test('it allows self-import references', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");
    await expect(page.locator('text=There is a lot of parking >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page.locator("text=Martha's Vineyard is a an Island in Massachusetts >> visible=true")).toHaveCount(2);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator("text=Martha's Vineyard is a an Island in Massachusetts >> visible=true")).toHaveCount(2);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot/Martha's_Vineyard#Cafeteria");
  });

  test('Pressing z zooms to lowest path segment', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('z');
    await expect(page).toHaveURL('/New_York#Southern_border');
    await expect(page.locator('h1')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
  });

  test('Pressing d duplicates tab', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('z');
    await expect(page).toHaveURL('/New_York#Southern_border');
    await expect(page.locator('h1')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
  });

  test('Pressing alt-up goes to previous topic', async ({ page, context }) => {
    await page.goto('United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press(`d`)
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Pressing tab goes through local references in DFS', async ({ page }) => {
    await page.goto('/United_States/New_Jersey#Northern_part');
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

  test('Pressing enter on URL link opens link in new tab', async ({ page, context }) => {
    await page.goto('United_States/New_York/Style_examples#URLs');
    await expect(page.locator('.canopy-selected-link')).toHaveText('URLs');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('http://google.com');

    await page.context().route(
        'http://*google.com/**',
        route => route.fulfill({ body: 'I am on www.google.com' })
    )

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press('Enter')
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('body')).toHaveText('I am on www.google.com');
  });

  test('Regular-clicking on URL link opens new tab', async ({ page, context }) => {
    await page.context().route(
      'http://*google.com/**',
      route => route.fulfill({ body: 'I am on www.google.com' })
    )

    await page.goto('United_States/New_York/Style_examples#URLs');
    await expect(page.locator('.canopy-selected-link')).toHaveText('URLs');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("http://google.com")').click()
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('body')).toHaveText('I am on www.google.com');
  });

  test('Navigating to default topic replaces history state', async ({ page, context }) => {
    await page.goto('/');
    await expect(page).toHaveURL('United_States');
    await page.goBack();

    let URL = await page.url();
    if (URL.includes('United_States')){
      expect(page).toHaveURL('United_States'); // Firefox doesn't allow browser back to new tab state, so we test for back being no-op
    } else {
      expect(page.locator('#_canopy')).toHaveCount(0);
    }
  });
});
