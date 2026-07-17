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

test.describe('Arrow keys', () => {
  test('Navigating left-to-right links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-section')).toContainText("There is italic text, bold text,");
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    await scrollElementToViewport(page, '.canopy-selected-link');
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
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('hyperlink special cases');
    await page.locator('body').press('ArrowLeft');
    await expect(page.locator('.canopy-selected-link')).toHaveText('hyperlinks');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('hyperlink special cases');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('link icon special cases');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('down cycle references');    
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('manual cycle arrow icons');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline HTML');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('footnotes');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('tooltips');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('special links');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('links in right-to-left text');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('links in mixed direction text');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('disabled links');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('full-line links'); // no more so test doesn't need updating
  });

  test('Navigating right-to-left links', async ({ page, browserName }) => {
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
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור שני');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('קישור ראשון');
    await page.locator('body').press('ArrowRight');
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

    await scrollElementToViewport(page, '.canopy-selected-link');
    await page.locator('body').press('ArrowUp');

    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Inline_text_styles");
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');
  });

  test('Down on bottom link opens child', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Special topic names');
    await expect(page.locator('.canopy-selected-section')).toContainText("There are italic topic names");
    await expect(page.locator('.canopy-selected-link')).toHaveText('special topic names');
    await expect(page.locator('#_canopy')).toHaveAttribute('data-display-in-progress', 'false');
    await page.locator('body').press('ArrowDown');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Special_topic_names/Italic_topic_names");
    await expect(page.locator('.canopy-selected-link')).toHaveText('italic topic names');
  });

  test('Menu links', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/United_States/New_York/Style_examples#Menu_links');
    await expect(page.locator('.canopy-selected-section')).toContainText("Menu cell 01");
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 01');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 05');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 06');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 07');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 08');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 09');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 10');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 11');
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 12');
    await page.locator('body').press('ArrowRight');
    await page.waitForSelector('text=menu links', { state: 'visible' });
    await expect(page.locator('.canopy-selected-link')).toHaveText('Menu cell 01');
    await page.locator('body').press('ArrowUp');

    await page.waitForSelector('a:has-text("menu links")', { state: 'visible' });
    const textAfterFirstPress = await page.locator('.canopy-selected-link').textContent(); // Check the text after the first press
    if (textAfterFirstPress !== "menu links") await page.locator('body').press('ArrowUp'); // small screen might take two presses

    await expect(page.locator('.canopy-selected-link')).toHaveText('menu links');
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
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border↩ of New York↩. >> visible=true')).toHaveCount(1);
  });

  test('Eager loading follows links inside eagerly loaded paragraphs', async ({ page }) => {
    const firstDegreeJson = page.waitForResponse(response =>
      response.url().match(/\/_data\/Eager_Branch_One_[a-f0-9]+\.json$/) && response.status() === 200
    );
    const secondDegreeJson = page.waitForResponse(response =>
      response.url().match(/\/_data\/Eager_Branch_Two_[a-f0-9]+\.json$/) && response.status() === 200
    );

    await page.goto('/Eager_loading');
    await firstDegreeJson;
    await secondDegreeJson;

    await expect(page).toHaveURL('/Eager_loading');
    await expect(page.locator('.canopy-selected-section')).toContainText('This topic links to Eager branch one.');
  });

  test('Initial page load with a deep URL scrolls to the selected paragraph', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Deep_initial_scroll_parent/Deep_initial_scroll_target');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Deep initial scroll target');

    const selectedTop = await page.locator('.canopy-selected-section > p.canopy-paragraph').evaluate(element => element.getBoundingClientRect().top);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    expect(selectedTop).toBeGreaterThanOrEqual(viewportHeight * 0.05);
    expect(selectedTop).toBeLessThan(viewportHeight * 0.3);
  });

  test('It decodes encoded path pound symbols', async ({ page }) => { // Eg Gmail does this sometimes to links
    await page.goto('United_States/New_York#Southern_border/New_Jersey%23Northern_border'); // this is an unescaped encoded #
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border'); //no redirects
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border↩ of New York↩. >> visible=true')).toHaveCount(1);
  });

  test('Pressing down on global link advances path', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page.locator('#_canopy')).toHaveAttribute('data-display-in-progress', 'false');
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

  test('Clicking on a selected global keeps its target displayed', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a:has-text("New York"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on an open global selects it', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page.locator('#_canopy')).toHaveAttribute('data-display-in-progress', 'false');

    await page.locator('a:has-text("New York"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
  });

  test('Clicking on a selected global child keeps its target displayed', async ({ page }) => {
    await page.goto('United_States/New_York/Martha\'s_Vineyard');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Martha\'s Vineyard');

    await page.locator('section[data-subtopic-name="New York"][data-path-depth="1"] > p > a[data-type="global"]:has-text("Martha\'s Vineyard")').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Martha\'s Vineyard');
    await expect(page).toHaveURL('United_States/New_York/Martha\'s_Vineyard');
  });

  test('Clicking on a selected global in root paragraph keeps its target displayed', async ({ page }) => {
    await page.goto('/United_States/New_York');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');

    await page.locator('a[data-type="global"]:has-text("New York"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('United_States/New_York');
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
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page.locator('#_canopy')).toHaveAttribute('data-display-in-progress', 'false');

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
    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border↩ of New York↩. >> visible=true')).toHaveCount(1);
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

  test('Clicking on a selected local keeps its target displayed', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('a:has-text("southern border"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');
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

  test('Clicking on a selected local child keeps its target displayed', async ({ page }) => {
    await page.goto('New_Jersey#Attractions');
    await expect(page.locator('.canopy-selected-link')).toHaveText('attractions');

    await page.locator('a[data-type="local"]:has-text("attractions"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('attractions');
    await expect(page).toHaveURL('New_Jersey#Attractions');
  });

  test('Clicking on a selected local in root paragraph keeps its target displayed', async ({ page }) => {
    await page.goto('New_Jersey#Northern_part');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');

    await page.locator('a[data-type="local"]:has-text("northern part"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern part');
    await expect(page).toHaveURL('New_Jersey#Northern_part');
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
    await expect(page.locator('.canopy-selected-section > p')).toContainText('The northern border of New Jersey abuts');
  });

  test('Down on path reference selects links of current paragraph', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Southern border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page.locator('#_canopy')).toHaveAttribute('data-display-in-progress', 'false');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Northern border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // path reference
    await expect(page.locator('.canopy-selected-section > p')).toContainText('The northern border of New Jersey abuts');
    await expect(page.locator('#_canopy')).toHaveAttribute('data-display-in-progress', 'false');

    await page.locator('body').press('ArrowDown');

    await expect(page.locator('.canopy-selected-link')).toHaveText('url'); // stays within paragraph
  });

  test('Down and enter on path reference are ignored while inline path placeholder is loading', async ({ page }) => {
    // Let this test initiate the gated request instead of the eager loader.
    await page.addInitScript(() => {
      window.requestIdleCallback = () => 0;
    });

    let releaseNewJerseyRequest;
    const newJerseyRequestGate = new Promise(resolve => {
      releaseNewJerseyRequest = resolve;
    });

    await page.route(/\/_data\/New_Jersey.*\.json$/i, async route => {
      await newJerseyRequestGate;
      await route.continue();
    });

    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Southern border');
    await expect(page.locator('#_canopy')).toHaveAttribute('data-display-in-progress', 'false');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page.locator('.canopy-loading-section')).toHaveCount(0);

    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-topic-name', 'New Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('.canopy-selected-section')).toHaveClass(/canopy-loading-section/);

    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('.canopy-selected-section')).toHaveClass(/canopy-loading-section/);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('.canopy-selected-section')).toHaveClass(/canopy-loading-section/);

    releaseNewJerseyRequest();

    await expect(page.locator('.canopy-selected-section')).not.toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-section > p')).toContainText('The northern border of New Jersey abuts');
  });

  test('Enter on path reference inlines target', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // path reference
    await expect(page.locator('.canopy-selected-section > p')).toContainText('The northern border of New Jersey abuts');

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

  test('Clicking on a selected path reference inlines target', async ({ page }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border'); // path reference
    await expect(page.locator('.canopy-selected-section > p')).toContainText('The northern border of New Jersey abuts');

    await page.locator('a.canopy-selected-link:has-text("northern border"):visible').click();

    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page).toHaveURL('United_States/New_York#Southern_border/New_Jersey#Northern_border');
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

    // The global reference should lose in the contest for parent link
    await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
      { has: page.locator('a:visible.canopy-open-link',
        { has: page.locator('text="New Jersey"') })}
    )).toHaveCount(0);

    // Path reference path should be open
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border↩ of New York↩. >> visible=true')).toHaveCount(1);

    await page.locator('a:has-text("attractions"):visible').click();

     // The path reference should be closed because we have navigated away from its path
     await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
       { has: page.locator('a:visible.canopy-open-link',
         { has: page.locator('text="northern border"') })}
     )).toHaveCount(0);

     // The global reference should still be open
     await expect(page.locator('.canopy-paragraph:has-text("The southern border of New York")',
       { has: page.locator('a:visible.canopy-open-link',
         { has: page.locator('text="New Jersey"') })}
     )).toHaveCount(1);
  });

  test('Clicking on a self-terminal reference inlines and focuses the child parent-link', async ({ page }) => {
    await page.goto('/California');

    const selfTerminalLink = page.locator(
      'section.canopy-selected-section[data-topic-name="California"][data-subtopic-name="California"] ' +
      'a:has-text("California in the states-by-region table"):visible'
    ).first();
    await expect(selfTerminalLink.locator('.canopy-down-cycle-icon, .canopy-back-cycle-icon, .canopy-up-cycle-icon, .canopy-forward-cycle-icon')).toHaveCount(0);

    await selfTerminalLink.click();

    await expect(page).toHaveURL('/California/States_by_Region');
    const selectedCaliforniaRowLink = page.locator(
      'a.canopy-selected-link[data-text="California"][data-enclosing-topic="States by Region"]'
    );
    await expect(selectedCaliforniaRowLink).toHaveCount(1);
    await expect(selectedCaliforniaRowLink).toHaveText(/California/);
    await expect(selectedCaliforniaRowLink).toHaveAttribute('data-enclosing-topic', 'States by Region');
    await expect(page.locator('text=California profile. >> visible=true')).toHaveCount(2);
    await expect(selectedCaliforniaRowLink).toBeInViewport();
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

    await scrollElementToViewport(page, '.canopy-selected-link');
    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");
    await expect(page.locator('text=There is a lot of parking >> visible=true')).toHaveCount(1);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria↩");
    await expect(page.locator("text=There is a lot of parking, and it is near the >> visible=true")).toHaveCount(1);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food >> visible=true')).toHaveCount(1);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Cafeteria");
  });

  test('it inlines cycle references with shift-down', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");

    await scrollElementToViewport(page, '.canopy-selected-link');
    await page.locator('body').press('ArrowRight');
    
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");
    await expect(page.locator('text=There is a lot of parking >> visible=true')).toHaveCount(1);

    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria↩");
    await expect(page.locator('text=There is a lot of parking, and it is near the >> visible=true')).toHaveCount(1);

    await page.locator('body').press('Shift+ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator("text=Martha's Vineyard is a an Island in Massachusetts. >> visible=true")).toHaveCount(2);
    await expect(page.locator("text=There is nice food. >> visible=true")).toHaveCount(1);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot/Martha's_Vineyard#Cafeteria");
  });

  test('it inlines cycle references with shift-click', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");

    await scrollElementToViewport(page, '.canopy-selected-link');
    await expect(page.locator('.canopy-selected-link')).toBeVisible();
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");
    await expect(page.locator('text=There is a lot of parking >> visible=true')).toHaveCount(1);

    await page.locator('a:has-text("cafeteria↩")').click({
      modifiers: ['Shift']
    });
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator("text=There is a lot of parking, and it is near the >> visible=true")).toHaveCount(1);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot/Martha's_Vineyard#Cafeteria");
  });

  test('it differentiates between back cycles and lateral', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard#Parking_lot`);
    await expect(page).toHaveURL('United_States/New_York/Martha\'s_Vineyard#Parking_lot');

    await expect(page.locator('a.canopy-selectable-link:visible .canopy-link-container').filter({ hasText: 'cafeteria↩' })).toHaveCount(1);
    await expect(page.locator('a.canopy-selectable-link:visible .canopy-link-container').filter({ hasText: "Martha's Vineyard↩" })).toHaveCount(1);
  });

  test('it resolves cycle links to fragment subtopics with wrong capitalization', async ({ page }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard#Parking_lot`);
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot");

    await page.locator('a:has-text("snack bar")').click();
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Snack_Bar");
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Snack Bar');
  });

  test('it differentiates between lateral cycles and down cycles', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Style_examples#Down_Cycle_References`);
    await expect(page).toHaveURL('United_States/New_York/Style_examples#Down_Cycle_References');

    await expect(page.locator('.canopy-selected-section a[data-text="solo hash links"]')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section a[data-text="solo hash links after"]')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section a[data-text="go down"]')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section a[data-text="go down forward"]')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-down-cycle-icon')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section .canopy-down-behind-cycle-icon')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-down-ahead-cycle-icon')).toHaveCount(1);

    await page.locator('a[data-text="go down"]').click()
    await expect(page.locator('.canopy-selected-link')).toHaveText("solo hash links");
    await expect(page).toHaveURL('United_States/New_York/Style_examples#Down_Cycle_References/Solo_hash_links');
  });

  test('Up-cycles reduce to the cycle root', async ({ page }) => {
    await page.goto('/United_States/New_Jersey#Northern_border/New_York#Southern_border');
    await expect(page).toHaveURL('/United_States/New_Jersey#Northern_border/New_York#Southern_border');

    await page.locator('.canopy-selected-section a:has-text("New Jersey")').click();

    await expect(page).toHaveURL('/United_States/New_Jersey');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New Jersey');
  });

  test('Cycle reduction inserts history stack frame', async ({ page, browserName }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard#Parking_lot`);
    await expect(page).toHaveURL(`/United_States/New_York/Martha's_Vineyard#Parking_lot`);
    await page.locator('a:has-text("cafeteria↩"):visible').click();
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria");
    await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);
    await page.goBack();
    await expect(page.locator('text=There is a lot of parking, and it is near the >> visible=true')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-link')).toHaveText("cafeteria↩");    
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
    await page.goto('/United_States/New_York');
    await expect(page).toHaveURL('/United_States/New_York');
    await page.goto('/'); // when this gets forwarded to United_States, it should replace the history state not add
    await expect(page).toHaveURL('United_States');
    await page.goBack();
    await expect(page).toHaveURL('/United_States/New_York');
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

    await page.click('text=The northern border of New Jersey abuts the southern border↩ of New York↩. >> text=southern border >> visible=true');
    await expect(page).toHaveURL('United_States/New_York#Southern_border');

    // we also want it to scroll to New_York#Southern_border, not to New_York, ie it should identify when nodes after the cycle occur
    // after the cycle start, because we should scroll to the lowest common ancestor before changing the selection, not the cycle starting point
    await expect(page.evaluate(() => window.scrollY)).not.toEqual(0);
  });
});
