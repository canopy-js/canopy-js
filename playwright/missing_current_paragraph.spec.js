import { test, expect } from './test-setup';

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
