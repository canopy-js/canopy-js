import { test, expect } from './test-setup';
const { scrollElementToViewport } = require('./helpers');

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
    await expect(page.locator('text=The northern border of New Jersey abuts the southern border↩ of New York↩. >> visible=true')).toHaveCount(1);
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

  test('Subtopics from previous renders are accessible', async ({ page }) => { // cached subtopics can be recalled by fetchAndRenderPath
    await page.goto('/United_States/New_Jersey'); // load New_Jersey#Northern_border and cache it
    await expect(page).toHaveURL("/United_States/New_Jersey");

    await page.goto('/United_States/New_Jersey#Northern_border/New_York#Southern_border'); // load New_Jersey#Northern_border from cache as parent for New_York
    await expect(page).toHaveURL("/United_States/New_Jersey#Northern_border/New_York#Southern_border");
  });

  test('Deep path navigation displays the deepest available loading placeholder first', async ({ page }) => {
    let releaseNewJerseyRequest;
    const newJerseyRequestGate = new Promise(resolve => {
      releaseNewJerseyRequest = resolve;
    });

    await page.route(/\/_data\/New_Jersey.*\.json$/i, async route => {
      await newJerseyRequestGate;
      await route.continue();
    });

    await page.goto('/United_States/New_York#Southern_border'); // load New_York#Southern_border so it can parent the placeholder
    await expect(page.locator('text=The southern border of New York abuts >> visible=true')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    const historyLength = await page.evaluate(() => history.length);
    await page.locator('body').press('Enter');

    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('.canopy-selected-section')).toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-topic-name', 'New Jersey');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York#Southern_border/New_Jersey');

    releaseNewJerseyRequest();

    await expect(page.locator('.canopy-selected-section')).not.toHaveClass(/canopy-loading-section/);
    await expect(page.locator('section[data-path-string="/United_States/New_York#Southern_border/New_Jersey"]')).not.toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-link')).toHaveText('northern border');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Northern border');
    await expect(page.locator('.canopy-selected-section')).toContainText('The northern border of New Jersey abuts');
    expect(await page.evaluate(() => history.length)).toBe(historyLength + 1);
  });

  test('Unloaded global topic link displays a loading placeholder before render completes', async ({ page }) => {
    let releaseNewJerseyRequest;
    const newJerseyRequestGate = new Promise(resolve => {
      releaseNewJerseyRequest = resolve;
    });

    await page.route(/\/_data\/New_Jersey.*\.json$/i, async route => {
      await newJerseyRequestGate;
      await route.continue();
    });

    await page.goto('/United_States');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States');
    await page.locator('a:has-text("New Jersey"):visible').click();

    await expect(page.locator('.canopy-selected-link')).toHaveText('New Jersey');
    await expect(page.locator('.canopy-selected-section')).toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_Jersey');

    releaseNewJerseyRequest();

    await expect(page.locator('.canopy-selected-section')).not.toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_Jersey');
    await expect(page.locator('.canopy-selected-section')).toContainText('The state of New Jersey has');
  });

  test('Placeholder render registers sibling subtopics before cycle icon callbacks run', async ({ page }) => {
    const pageErrors = [];
    let releaseStyleExamplesRequest;
    const styleExamplesRequestGate = new Promise(resolve => {
      releaseStyleExamplesRequest = resolve;
    });

    page.on('pageerror', error => pageErrors.push(error.message));

    await page.route(/\/_data\/Placeholder_cycle_callbacks.*\.json$/i, async route => {
      await styleExamplesRequestGate;
      await route.continue();
    });

    await page.goto('/Bugs');
    await page.locator('a:has-text("placeholder cycle callbacks"):visible').click();

    await expect(page.locator('.canopy-selected-section')).toHaveClass(/canopy-loading-section/);
    releaseStyleExamplesRequest();

    await expect(page.locator('.canopy-selected-section')).not.toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-section > p')).toContainText('This fixture catches a bug');
    await expect(page.locator('.canopy-selected-section')).not.toContainText('Introduction.');
    expect(pageErrors).not.toContainEqual(expect.stringContaining('ancestorOf requires DOM paragraphs'));
  });

  test('Stale deep path render does not run final display after newer navigation', async ({ page }) => {
    let releaseNewJerseyRequest;
    const newJerseyRequestGate = new Promise(resolve => {
      releaseNewJerseyRequest = resolve;
    });

    await page.route(/\/_data\/New_Jersey.*\.json$/i, async route => {
      await newJerseyRequestGate;
      await route.continue();
    });

    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await page.locator('body').press('Enter');

    await expect(page.locator('.canopy-selected-section')).toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-topic-name', 'New Jersey');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York#Southern_border/New_Jersey');

    await page.locator('a.canopy-selectable-link:visible[href="/New_York"]').click();
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-topic-name', 'New York');

    const newJerseyResponse = page.waitForResponse(/\/_data\/New_Jersey.*\.json$/i);
    releaseNewJerseyRequest();
    await newJerseyResponse;
    await page.waitForTimeout(100);

    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-topic-name', 'New York');
  });

  test('Browser back after root refresh keeps a loading graphic while deep path loads', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Covers the Chrome browser-back flow this regression came from.');

    let gateNewJerseyRequest = false;
    let releaseNewJerseyRequest;
    const newJerseyRequestGate = new Promise(resolve => {
      releaseNewJerseyRequest = resolve;
    });

    await page.route(/\/_data\/New_Jersey.*\.json$/i, async route => {
      if (gateNewJerseyRequest) await newJerseyRequestGate;
      await route.continue();
    });

    await page.goto('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Northern border');

    await page.goto('/United_States');
    await page.reload();
    await expect(page).toHaveURL('/United_States');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States');

    gateNewJerseyRequest = true;
    await page.goBack();

    await expect(page).toHaveURL('/United_States/New_York#Southern_border/New_Jersey#Northern_border');
    await expect(page.locator('.canopy-boot-loading-graphic, .canopy-loading-section > .canopy-loading-graphic').first()).toBeVisible();

    releaseNewJerseyRequest();

    await expect(page.locator('.canopy-selected-section')).not.toHaveClass(/canopy-loading-section/);
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-subtopic-name', 'Northern border');
  });

  test('Last link selections are preferred when going down', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples');
    await expect(page.locator('h1:visible')).toHaveText('United States');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style examples');
    await expect(page.locator('.canopy-selected-section > p')).toContainText('These are some style examples.'); // prevent advance before scroll

    await scrollElementToViewport(page, '.canopy-selected-link');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');

    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('multi-line tokens');

    await page.locator('body').press('ArrowUp');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style examples');

    await page.reload();
    await expect(page.locator('.canopy-selected-link')).toHaveText('style examples');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('multi-line tokens');
  });
});
