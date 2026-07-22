import { test, expect } from './test-setup';
const { scrollElementToViewport } = require('./helpers');

test.describe('Arrow key presses', () => {
  test('A quick tap performs one navigation action', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');

    await scrollElementToViewport(page, '.canopy-selected-link');
    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText('images');
  });

  test('Repeated keydown events scroll without navigating and stop on release', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    await page.evaluate(() => {
      document.querySelector('#_canopy').style.minHeight = '3000px';
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    await page.keyboard.down('ArrowDown');
    for (let repeat = 0; repeat < 5; repeat++) {
      await page.keyboard.down('ArrowDown');
    }

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(30);
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');

    await page.keyboard.up('ArrowDown');
    const scrollAtRelease = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(150);

    expect(await page.evaluate(() => window.scrollY)).toBe(scrollAtRelease);
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
  });

  test('Holding ArrowUp scrolls upward without navigating', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    await page.evaluate(() => {
      document.querySelector('#_canopy').style.minHeight = '3000px';
      window.scrollTo({ top: 500, behavior: 'instant' });
    });
    const initialScroll = await page.evaluate(() => window.scrollY);

    await page.keyboard.down('ArrowUp');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(initialScroll - 30);
    await page.keyboard.up('ArrowUp');

    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
  });

  test('Holding left and right scrolls horizontally without navigating', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    await page.evaluate(() => {
      document.querySelector('#_canopy').style.width = '3000px';
      window.scrollTo({ left: 500, behavior: 'instant' });
    });
    const initialScroll = await page.evaluate(() => window.scrollX);

    await page.keyboard.down('ArrowRight');
    await expect.poll(() => page.evaluate(() => window.scrollX)).toBeGreaterThan(initialScroll + 30);
    await page.keyboard.up('ArrowRight');
    const rightScroll = await page.evaluate(() => window.scrollX);

    await page.keyboard.down('ArrowLeft');
    await expect.poll(() => page.evaluate(() => window.scrollX)).toBeLessThan(rightScroll - 30);
    await page.keyboard.up('ArrowLeft');

    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
  });

  test('Arrow keys retain their native behavior in editable elements', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    await page.evaluate(() => {
      let input = document.createElement('input');
      input.value = 'input';
      input.id = 'arrow-input';
      document.body.prepend(input);

      let textarea = document.createElement('textarea');
      textarea.value = 'textarea';
      textarea.id = 'arrow-textarea';
      document.body.prepend(textarea);

      let editable = document.createElement('div');
      editable.contentEditable = 'true';
      editable.id = 'arrow-contenteditable';
      editable.textContent = 'editable';
      document.body.prepend(editable);
    });

    for (const selector of ['#arrow-input', '#arrow-textarea', '#arrow-contenteditable']) {
      await page.locator(selector).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator(selector)).toBeFocused();
      await expect(page.locator('.canopy-selected-link')).toHaveText('style characters');
    }
  });
});

test.describe('Arrow key scrolling', () => {
  test('The last section can scroll its bottom to five percent of the viewport', async ({ page }) => {
    const scrollErrors = [];
    page.on('console', message => {
      if (message.type() === 'error' && message.text().includes('Scrollable area not long enough')) {
        scrollErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names/Topic_with_no_child_links');
    await expect(page.locator('.canopy-selected-link')).toHaveText('topic with no child links');
    const finalSection = page.locator('.canopy-selected-section');
    const finalPath = '/United_States/New_York/Style_examples#Special_topic_names/Topic_with_no_child_links';
    await expect(finalSection).toHaveAttribute('data-path-string', finalPath);
    await expect(finalSection).toContainText('This paragraph has no child links');
    const scrollPadding = await page.locator('#_canopy').evaluate(canopy => ({
      actual: parseFloat(getComputedStyle(canopy).paddingBottom),
      expected: window.innerHeight * 0.95
    }));

    expect(scrollPadding.actual).toBeCloseTo(scrollPadding.expected, 0);

    await page.locator('body').press('ArrowDown');

    await expect(finalSection).toHaveAttribute('data-path-string', finalPath);
    await expect(page.locator('.canopy-selected-link')).toHaveText('topic with no child links');
    await expect.poll(() => finalSection.evaluate(section => (
      section.getBoundingClientRect().bottom / window.innerHeight
    ))).toBeLessThanOrEqual(0.055);
    expect(await finalSection.evaluate(section => section.getBoundingClientRect().bottom)).toBeGreaterThan(0);
    expect(scrollErrors).toEqual([]);
  });
});

test.describe('Arrow key link navigation', () => {
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

  test('Navigating right-to-left links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_in_right-to-left_text');
    const rtlSection = page.locator('.canopy-selected-section[data-path-string="/United_States/New_York/Style_examples#Links_in_right-to-left_text"]');
    const firstRtlLinkSelector = '.canopy-selected-section[data-path-string="/United_States/New_York/Style_examples#Links_in_right-to-left_text"] a[data-text="קישור ראשון"]';
    await expect(rtlSection).toContainText("זוהי פסקה של טקסט");
    await scrollElementToViewport(page, firstRtlLinkSelector);
    await expect(page.locator(firstRtlLinkSelector)).toBeInViewport();
    await page.locator('body').press('Enter');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York/Style_examples#קישור_ראשון');
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

  test('Navigating mixed-direction links', async ({ page }) => {
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

  test('ArrowUp on the top link closes the paragraph', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Style_characters');
    await expect(page.locator('.canopy-selected-section')).toContainText("There is italic text, bold text");

    await scrollElementToViewport(page, '.canopy-selected-link');
    await page.locator('body').press('ArrowUp');

    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Inline_text_styles");
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');
  });

  test('ArrowDown on a parent link opens one of its children', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York/Style_examples#Special_topic_names');
    await expect(page.locator('.canopy-selected-section')).toContainText("There are italic topic names");
    await expect(page.locator('.canopy-selected-link')).toHaveText('special topic names');
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute(
      'data-path-string',
      /^\/United_States\/New_York\/Style_examples#Special_topic_names\//
    );
    await expect(page.locator('.canopy-selected-link')).not.toHaveText('special topic names');
  });

  test('ArrowDown is a no-op while there is no current paragraph', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names');
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute('data-path-string', '/United_States/New_York/Style_examples#Special_topic_names');
    await expect(page.locator('.canopy-selected-link')).toHaveText('special topic names');

    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error));

    await page.evaluate(() => {
      const selectedLink = document.querySelector('.canopy-selected-link');
      document.querySelectorAll('.canopy-selectable-link').forEach(link => {
        if (link === selectedLink) return;

        link.dataset.testOriginalDisplay = link.style.display;
        link.style.display = 'none';
      });

      const selectedSection = document.querySelector('.canopy-selected-section');
      selectedSection.classList.remove('canopy-selected-section');
      selectedSection.dataset.testSelectedSection = '';

      window.testArrowNavigationScrollCalls = 0;
      window.testArrowNavigationOriginalScrollTo = window.scrollTo;
      window.scrollTo = function(...args) {
        window.testArrowNavigationScrollCalls += 1;
        return window.testArrowNavigationOriginalScrollTo.apply(window, args);
      };
    });

    await page.locator('body').press('ArrowDown');

    expect(pageErrors).toEqual([]);
    expect(await page.evaluate(() => window.testArrowNavigationScrollCalls)).toBe(0);

    await page.evaluate(() => {
      window.scrollTo = window.testArrowNavigationOriginalScrollTo;
      delete window.testArrowNavigationOriginalScrollTo;
      delete window.testArrowNavigationScrollCalls;

      document.querySelector('[data-test-selected-section]').classList.add('canopy-selected-section');
      document.querySelector('[data-test-selected-section]').removeAttribute('data-test-selected-section');
      document.querySelectorAll('[data-test-original-display]').forEach(link => {
        link.style.display = link.dataset.testOriginalDisplay;
        link.removeAttribute('data-test-original-display');
      });
    });

    await page.locator('body').press('ArrowDown');

    await expect(page.locator('.canopy-selected-section')).toHaveAttribute(
      'data-path-string',
      /^\/United_States\/New_York\/Style_examples#Special_topic_names\//
    );
    await expect(page.locator('.canopy-selected-link')).not.toHaveText('special topic names');
  });

  test('Arrow keys navigate menu links', async ({ page }) => {
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

test.describe('Modified downward navigation', () => {
  for (const modifier of ['Shift', 'Alt']) {
    test(`${modifier}+ArrowDown falls back to ordinary navigation for a non-cycle link`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));

      await page.goto('/United_States/New_York/Style_examples#Special_topic_names');
      await expect(page.locator('.canopy-selected-section')).toContainText('There are italic topic names');
      await expect(page.locator('.canopy-selected-link')).toHaveText('special topic names');
      await scrollElementToViewport(page, '.canopy-selected-section > p a.canopy-selectable-link:nth-of-type(1)');

      await page.locator('body').press(`${modifier}+ArrowDown`);

      expect(pageErrors).toEqual([]);
      await expect(page.locator('.canopy-selected-section')).toHaveAttribute(
        'data-path-string',
        /^\/United_States\/New_York\/Style_examples#Special_topic_names\//
      );
      await expect(page.locator('.canopy-selected-link')).not.toHaveText('special topic names');
      expect(pageErrors).toEqual([]);
    });

    test(`${modifier}+ArrowDown still inlines a cycle link`, async ({ page }) => {
      await selectCycleReference(page);

      await page.locator('body').press(`${modifier}+ArrowDown`);

      await expect(page.locator('.canopy-selected-link')).toHaveText('cafeteria');
      await expect(page.locator("text=Martha's Vineyard is a an Island in Massachusetts. >> visible=true")).toHaveCount(2);
      await expect(page.locator('text=There is nice food. >> visible=true')).toHaveCount(1);
      await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard#Parking_lot/Martha's_Vineyard#Cafeteria");
    });
  }

  test('moveDownOrRedirect accepts an omitted options argument', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('/United_States/New_York/Style_examples#Special_topic_names');
    await expect(page.locator('.canopy-selected-section')).toContainText('There are italic topic names');
    await expect(page.locator('.canopy-selected-link')).toHaveText('special topic names');
    await scrollElementToViewport(page, '.canopy-selected-section > p a.canopy-selectable-link:nth-of-type(1)');

    await page.locator('body').press('n');

    expect(pageErrors).toEqual([]);
    await expect(page.locator('.canopy-selected-section')).toHaveAttribute(
      'data-path-string',
      /^\/United_States\/New_York\/Style_examples#Special_topic_names\//
    );
    await expect(page.locator('.canopy-selected-link')).not.toHaveText('special topic names');
    expect(pageErrors).toEqual([]);
  });
});

async function selectCycleReference(page) {
  await page.goto(`/United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history`);
  await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");

  await scrollElementToViewport(page, '.canopy-selected-link');
  await page.locator('body').press('ArrowRight');
  await expect(page.locator('.canopy-selected-link')).toHaveText('cafeteria');

  await page.locator('body').press('ArrowRight');
  await expect(page.locator('.canopy-selected-link')).toHaveText('parking lot');

  await page.locator('body').press('Enter');
  await expect(page.locator('.canopy-selected-link')).toHaveText('cafeteria↩');
}
