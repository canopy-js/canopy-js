const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.on("console", logBrowserErrors);

  await page.goto('/United_States');
  await expect(page).toHaveURL("United_States");
  await page.evaluate(() => localStorage.clear()); // get rid of old link selections
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
    await expect(page.locator('.canopy-selected-link')).toHaveText('link icon special cases');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('links in right-to-left text');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('links in mixed direction text');
  });

  test('Navigating right-to-left links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_in_right-to-left_text');
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
    await expect(page.locator('.canopy-selected-link')).toHaveText('first left to right link');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('second left to right link');
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור השלישי');
    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור הראשון');
  });

  test('Up on top link closes paragraph', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-section')).toContainText("There is italic text, bold text");
    await page.locator('body').press('ArrowUp');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Inline_text_styles");
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');
  });

  test('Down on bottom link opens child', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names');
    await expect(page.locator('.canopy-selected-section')).toContainText("There are italic topic names");
    await page.locator('body').press('ArrowDown');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Special_topic_names/Italic_topic_names");
    await expect(page.locator('.canopy-selected-link')).toHaveText('italic topic names');
  });

  test('Table list links', async ({ page }) => {
    page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/United_States/New_York/Style_examples#Table_list_links');
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
    await page.waitForSelector('text=table list links', { state: 'visible' });
    await expect(page.locator('.canopy-selected-link')).toHaveText('Table list cell 01');
    await page.locator('body').press('ArrowUp');

    await page.waitForSelector('a:has-text("table list links")', { state: 'visible' });
    const textAfterFirstPress = await page.locator('.canopy-selected-link').textContent(); // Check the text after the first press
    if (textAfterFirstPress !== "table list links") await page.locator('body').press('ArrowUp'); // small screen might take two presses

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
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(newPage).toHaveURL('United_States/New_York');
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

    await page.locator('a:has-text("New York"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global deselects', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("New York"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link >> visible=true')).toHaveCount(0);
    await expect(page).toHaveURL('United_States');
  });

  test('Clicking on an open global selects it', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("New York"):visible').click();

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

    await page.locator('a[data-type="global"]:has-text("New York"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('United_States');
  });
  test('Alt-clicking on global redirects the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveText('United States');

    await page.locator('a:has-text("New York"):visible').click({
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
      page.locator('a:has-text("New York"):visible').click({
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
      page.locator('a:has-text("New Jersey"):visible').click({
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
      page.locator('a:has-text("New York"):visible').click({
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
    await expect(page).toHaveURL('/United_States/New_York#Southern_border');
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
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Clicking on local inlines link', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("southern border"):visible').click();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Clicking on a selected local deselects', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("southern border"):visible').click();

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

    await page.locator('a[data-type="local"]:has-text("attractions"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');
    await expect(page).toHaveURL('New_Jersey#Northern_part');
  });

  test('Clicking on a selected local in root paragraph deselects all', async ({ page }) => {
    await page.goto('New_Jersey#Northern_part');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');

    await page.locator('a[data-type="local"]:has-text("northern part"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveCount(0);
    await expect(page).toHaveURL('New_Jersey');
  });

  test('Alt-clicking on local zooms to the lowest path segment', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("southern border"):visible').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1:visible')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('New_York#Southern_border');
  });

  test('Meta-clicking on local link opens new tab to same path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border"):visible').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border');
  });

  test('Meta-option-clicking on local opens new tab to the existing path', async ({ page, context }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("southern border"):visible').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('New York');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(newPage).toHaveURL('New_York#Southern_border');
  });

  test('Selecting a path reference previews path', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Down on path reference selects child', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // path reference

    await page.locator('body').press('ArrowDown');

    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part'); // does not skip level
  });

  test('Enter on path reference inlines target', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // path reference

    // Link below should be open
    await expect(page.locator('.canopy-paragraph:has-text("The state of New Jersey has")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="northern part"') })}
    )).toHaveCount(1);

    await page.locator('body').press('Enter'); //skips level

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
  });

  test('Clicking on a path reference inlines the reference path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("northern border"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');

    // The path reference should be selected and open
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="northern border"') })}
    )).toHaveCount(1);

    // The global reference should not be open because it loses in the contest for parent link
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="New Jersey"') })}
    )).toHaveCount(0);

    // Path reference path should be open
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border of New York. >> visible=true')).toHaveCount(1);
  });

  test('Alt-clicking on a path reference redirects to the reference path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("northern border"):visible').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-clicking on a path reference opens to the inlined path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border"):visible').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');
  });

  test('Meta-alt-clicking on a path reference opens to the new path', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("northern border"):visible').click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('New Jersey');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(newPage).toHaveURL('New_Jersey#Northern_border');
  });

  test('Meta-enter on path-reference opens to the inlined path', async ({ page, context }) => {
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

  test('it path-reduces self-path references', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");
    await expect(page.locator('text=There is a lot of parking >> visible=true')).toHaveCount(1);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator("text=There is a lot of parking, and it is near the >> visible=true")).toHaveCount(1);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food >> visible=true')).toHaveCount(1);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Cafeteria");
  });

  test('it inlines cycle references with shift-down', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");
    await expect(page.locator('text=There is a lot of parking >> visible=true')).toHaveCount(1);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");

    await page.locator('body').press('Shift+ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator("text=Martha's Vineyard is a an Island in Massachusetts. >> visible=true")).toHaveCount(2);
    await expect(page.locator("text=There is nice food. >> visible=true")).toHaveCount(1);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot/Martha's_Vineyard#Cafeteria");
  });

  test('it inlines cycle references with shift-click', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");
    await expect(page.locator('text=There is a lot of parking >> visible=true')).toHaveCount(1);

    await page.locator('a:has-text("cafeteria").canopy-lateral-cycle-link').click({
      modifiers: ['Shift']
    });
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator("text=There is a lot of parking, and it is near the >> visible=true")).toHaveCount(1);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot/Martha's_Vineyard#Cafeteria");
  });

  test('it differentiates between back cycles and lateral', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard#Parking_lot`);
    await expect(page).toHaveURL('United_States/New_York/Martha\'s_Vineyard#Parking_lot');

    // Function to get the text content including ::after content for a link
    const getTextIncludingAfter = async (selector) => {
      const element = await page.$(selector);
      const elementText = await element.textContent();
      const afterContent = await page.evaluate(el => {
        const style = window.getComputedStyle(el, '::after');
        return style.content;
      }, element);

      // Remove quotes added by getComputedStyle around the content value
      const cleanedAfterContent = afterContent.replace(/^"|"$/g, '');

      return elementText + cleanedAfterContent;
    };

    // Get the combined text for the first link
    const combinedTextFirstLink = await getTextIncludingAfter('a.canopy-selectable-link.canopy-lateral-cycle-link:visible');
    // Assert the combined text for the first link
    expect(combinedTextFirstLink).toBe('cafeteria↪');

    // Get the combined text for the second link
    const combinedTextSecondLink = await getTextIncludingAfter('a.canopy-selectable-link.canopy-back-cycle-link:visible');
    // Assert the combined text for the second link
    expect(combinedTextSecondLink).toBe('Martha\'s Vineyard↩');
  });

  test('Pressing z zooms to lowest path segment', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('z');
    await expect(page).toHaveURL('/New_York#Southern_border');
    await expect(page.locator('h1:visible')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
  });

  test('Pressing d duplicates tab', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('body').press(`d`)
    ]);
    await expect(newPage).toHaveURL('/United_States/New_York#Southern_border');
    await expect(newPage.locator('h1:visible')).toHaveText('United States');
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('southern border');
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

  test('It reduces paths', async ({ page, context }) => {
    await page.goto('United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('h1')).toBeVisible();

    await page.click('text=The northern border of New Jersey abuts the southern border of New York. >> text=southern border >> visible=true');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');

    // we also want it to scroll to New_York#Southern_border, not to New_York, ie it should identify when nodes after the cycle occur
    // after the cycle start, because we should scroll to the lowest common ancestor before changing the selection, not the cycle starting point
    await expect(page.evaluate(() => window.scrollY)).not.toEqual(0);
  });
});
