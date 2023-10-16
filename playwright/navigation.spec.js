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

test.describe('Arrow keys', () => {
  test('Navigating left-to-right links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    page.setViewportSize({ width: 2000, height: 1000 });
    await expect(page.locator('.canopy-selected-section')).toContainText("There is italic text, bold text,");
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('images');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('local images');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('linked images');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('URLs');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('hyperlinks');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('URLs');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('hyperlinks');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('link icon special cases');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline HTML');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('footnotes');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('special links');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('links in right-to-left text');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('links in mixed direction text');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline HTML');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('links in mixed direction text');
  });

  test('Navigating right-to-left links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_in_right-to-left_text');
    page.setViewportSize({ width: 2000, height: 1000 });
    await expect(page.locator('.canopy-selected-section')).toContainText("זוהי פסקה של טקסט");
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור ראשון');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור שני');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור שלישי');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור ראשון');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור שלישי');
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור שני');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור שלישי');
  });

  test('Navigating mixed links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_in_mixed_direction_text');
    page.setViewportSize({ width: 2000, height: 1000 });
    await expect(page.locator('.canopy-selected-section')).toContainText("זוהי פסקה של טקסט");
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור הראשון');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור השני');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור השלישי');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('first left to right link');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור השלישי');
    await page.locator('body').press('ArrowLeft');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('second left to right link');
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור השלישי');
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור הראשון');
  });

  test('Up on top link closes paragraph', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    page.setViewportSize({ width: 2000, height: 1000 });
    await expect(page.locator('.canopy-selected-section')).toContainText("There is italic text, bold text");
    await page.locator('body').press('ArrowUp');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Inline_text_styles");
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');
  });

  test('Down on bottom link opens child', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names');
    page.setViewportSize({ width: 2000, height: 1000 });
    await expect(page.locator('.canopy-selected-section')).toContainText("There are italic topic names");
    await page.locator('body').press('ArrowDown');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Special_topic_names/Italic_topic_names");
    await expect(page.locator('.canopy-selected-link')).toHaveText('italic topic names');
  });

  test('Table list links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Table_list_links');
    page.setViewportSize({ width: 2000, height: 1000 });
    await expect(page.locator('.canopy-selected-section')).toContainText("Table list cell 01");
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 01');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 05');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 06');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 07');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 08');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 09');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 10');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 11');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 12');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 01');
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('table list links');
  });
});

test.describe('Navigation', () => {
  test('Selecting a global or local link previews child paragraph', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');

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

  test('Pressing enter on global appends to path', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-link')).toHaveCount(1);
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
    await expect(page.locator('h1:visible')).toHaveText('United States');
  });

  test('Meta-enter on global link opens new tab to same path', async ({ page, context, browserName }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.keyboard.press(`${systemNewTabKey}+Enter`)
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Meta-Alt-Enter on global link opens new tab to redirected path', async ({ page, context, browserName }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.keyboard.press(`${systemNewTabKey}+Alt+Enter`)
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(newPage).toHaveURL('New_York');
  });

  test('Clicking on global inlines link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');

    await page.locator('text=New York').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global deselects', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("New York")').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(page).toHaveURL('United_States');
  });

  test('Clicking on an open global selects it', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("New York")').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global selects parent', async ({ page }) => {
    await page.goto('United_States/New_York/Martha\'s_Vineyard');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Martha\'s Vineyard');

    await page.locator('section[data-subtopic-name="New York"][data-path-depth="1"] > p > a[data-type="global"]:has-text("Martha\'s Vineyard")').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global in root paragraph deselects all', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a[data-type="global"]:has-text("New York")').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('United_States');
  });
  test('Alt-clicking on global redirects the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');

    await page.locator('text=New York').click({
      modifiers: ['Alt']
    });
    await expect(page.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(page).toHaveURL('New_York'); // Link selected on redirect
    await expect(page.locator('h1:visible')).toHaveText('New York');
  });

  test('Meta-clicking on open global opens new tab to previous path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New York")').click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage).toHaveURL('/United_States/New_York');
  });

  test('Meta-clicking on closed global opens new tab to same path', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New Jersey")').click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage).toHaveURL('United_States/New_Jersey');
  });

  test('Meta-alt-clicking on global link opens new tab to new path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("New York")').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(newPage).toHaveURL('New_York');
  });

  test('Pressing enter on local link advances path', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Pressing meta-enter on local opens new tab to same path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press(`${systemNewTabKey}+Enter`)
    ]);

    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');
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

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on an open local selects it', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    await page.locator('a[data-type="local"]:has-text("southern border")').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Clicking on a selected local selects parent', async ({ page }) => {
    await page.goto('New_Jersey#Attractions');
    await expect(page.locator('.canopy-selected-link')).toHaveText('attractions');

    await page.locator('a[data-type="local"]:has-text("attractions")').click();

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');
    await expect(page).toHaveURL('New_Jersey#Northern_part');
  });

  test('Clicking on a selected local in root paragraph deselects all', async ({ page }) => {
    await page.goto('New_Jersey#Northern_part');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');

    await page.locator('a[data-type="local"]:has-text("northern part")').click();

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('New_Jersey');
  });

  test('Alt-clicking on local zooms to the lowest path segment', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("southern border")').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1:visible')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('New_York#Southern_border');
  });

  test('Meta-clicking on local link opens new tab to zoomed path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border")').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('New_York#Southern_border');
  });

  test('Meta-option-clicking on local opens new tab to the existing path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border")').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Selecting import reference previews path', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Down on import reference selects target', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // import reference

    await page.locator('body').press('Enter'); // skips a level

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    // When an import reference is navigated to inline, both the parent global link and the import link should be "open"
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="northern border"') })}
    )).toHaveCount(1);

    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="New Jersey"') })}
    )).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Attractions');

    // Now that we have navigated away from the import path, only the global parent link should be open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link', { has: page.locator('text="northern border"') })}
    )).toHaveCount(0);

    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="New Jersey"') })}
    )).toHaveCount(1);
  });

  test('Enter on import reference inlines target', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // import reference

    await page.locator('body').press('Enter');

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
  });

  test('Clicking on an import inlines the import path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("northern border")').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');

    // The import reference should be selected and open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link.canopy-selected-link',
        { has: page.locator('text="northern border"') })}
    )).toHaveCount(1);

    // The global reference should be open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="New Jersey"') })}
    )).toHaveCount(1);

    // But the global reference should not be selected
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link.canopy-selected-link',
        { has: page.locator('text="New Jersey"') })}
    )).toHaveCount(0);

    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Alt-clicking on an import redirects to the import path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("northern border")').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-clicking on an import opens to the inlined path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border")').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
  });

  test('Meta-alt-clicking on an import opens to the new path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border")').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('New Jersey');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-enter on an import opens to the inlined path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press(`${systemNewTabKey}+Enter`)
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');
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

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page.locator("text=Martha's Vineyard is a an Island in Massachusetts >> visible=true")).toHaveCount(2);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food >> visible=true')).toHaveCount(1);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator("text=Martha's Vineyard is a an Island in Massachusetts >> visible=true")).toHaveCount(2);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot/Martha's_Vineyard#Cafeteria");
  });

  test('Pressing z zooms to lowest path segment', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('z');
    await expect(page).toHaveURL('/New_York#Southern_border');
    await expect(page.locator('h1:visible')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
  });

  test('Pressing d duplicates tab', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('z');
    await expect(page).toHaveURL('/New_York#Southern_border');
    await expect(page.locator('h1:visible')).toHaveText('New York');
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
    await page.locator('body').press('Enter');
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

  test('Redirecting to default topic replaces history state', async ({ page, context }) => {
    await page.goto('/');
    await expect(page).toHaveURL('United_States');
    await page.goBack();

    let URL = await page.url();
    if (URL.includes('United_States')){
      expect(page).toHaveURL('United_States'); // Firefox doesn't allow browser back to new tab state, so we test for back being no-op
    } else {
      expect(await page.locator('#_canopy').count()).toEqual(0);
    }
  });

  test('Escape on root paragraph navigates to default topic', async ({ page, context }) => {
    await page.goto('/New_York');
    await expect(page).toHaveURL('New_York');

    await page.locator('body').press('Escape');

    await expect(page).toHaveURL('United_States');
  });
});
