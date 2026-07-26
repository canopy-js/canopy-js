import { test, expect } from './test-setup';

async function holdCanopyScript(page) {
  let releaseCanopyScript;
  const canopyScriptGate = new Promise(resolve => {
    releaseCanopyScript = resolve;
  });

  await page.route(/\/_canopy\.js$/i, async route => {
    await canopyScriptGate;
    await route.continue();
  });

  return releaseCanopyScript;
}

async function stubCanopyScript(page) {
  await page.route(/\/_canopy\.js$/i, route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: ''
  }));
}

test.describe('Bootloader', () => {
  test('stays fixed in place while fading out', async ({ page }) => {
    const releaseCanopyScript = await holdCanopyScript(page);

    const navigation = page.goto('/United_States');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveCount(1);
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-visible/);
    await page.addStyleTag({
      content: '.canopy-boot-loading-graphic-fading-out { animation-duration: 1s !important; }'
    });

    const initialTop = await loader.evaluate(element => element.getBoundingClientRect().top);
    releaseCanopyScript();

    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-fading-out/);

    const sampledTops = [
      initialTop,
      await loader.evaluate(element => element.getBoundingClientRect().top)
    ];
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(20);
      const top = await page.evaluate(() => {
        const element = document.querySelector('#_canopy > .canopy-boot-loading-graphic');
        if (!element) return null;
        const style = getComputedStyle(element);
        if (style.display === 'none' || Number(style.opacity) <= 0.01) return null;
        return element ? element.getBoundingClientRect().top : null;
      });
      if (top === null) break;
      sampledTops.push(top);
    }

    const maxDelta = Math.max(...sampledTops.map(top => Math.abs(top - initialTop)));
    expect(
      maxDelta,
      `Bootloader moved vertically during fade. Initial top: ${initialTop}; sampled tops: ${sampledTops.join(', ')}`
    ).toBeLessThanOrEqual(1);

    await navigation;
    await expect(loader).toHaveCount(0);
  });

  test('keeps content fixed in place once visible', async ({ page }) => {
    const releaseCanopyScript = await holdCanopyScript(page);

    const navigation = page.goto('/United_States');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    const firstParagraph = page.locator('section.canopy-section:not(.canopy-loading-section) > p.canopy-paragraph').first();
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-visible/);

    releaseCanopyScript();

    await expect(firstParagraph).toBeVisible();

    const initialTop = await firstParagraph.evaluate(element => element.getBoundingClientRect().top);
    const sampledTops = [initialTop];
    for (let i = 0; i < 14; i++) {
      await page.waitForTimeout(20);
      sampledTops.push(await firstParagraph.evaluate(element => element.getBoundingClientRect().top));
    }

    const maxDelta = Math.max(...sampledTops.map(top => Math.abs(top - initialTop)));
    expect(
      maxDelta,
      `First paragraph moved vertically after becoming visible. Initial top: ${initialTop}; sampled tops: ${sampledTops.join(', ')}`
    ).toBeLessThanOrEqual(1);

    await navigation;
    await expect(loader).toHaveCount(0);
  });

  test('lays out content invisibly until the visible bootloader can fade', async ({ page }) => {
    const releaseCanopyScript = await holdCanopyScript(page);

    const navigation = page.goto('/United_States');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-visible/);
    await loader.evaluate(element => {
      window.__canopyNativeSetTimeout = window.setTimeout.bind(window);
      window.__canopyBootloaderRemoval = null;
      window.setTimeout = (callback, delay, ...args) => {
        if (delay > 50000) {
          window.__canopyBootloaderRemoval = () => callback(...args);
          return 0;
        }
        return window.__canopyNativeSetTimeout(callback, delay, ...args);
      };
      element.dataset.canopyBootloaderVisibleAt = String(Date.now() + 60000);
    });

    releaseCanopyScript();

    const firstSection = page.locator('section.canopy-section').first();
    await page.waitForFunction(() => typeof window.__canopyBootloaderRemoval === 'function');
    await expect(firstSection).toHaveCount(1);
    await expect(firstSection).toHaveCSS('opacity', '0');
    await page.waitForTimeout(100);
    await expect(firstSection).toHaveCSS('opacity', '0');
    await expect(firstSection).toContainText('United States');
    await expect(page.locator('.canopy-selected-section')).toHaveCount(1);
    const hiddenTop = await firstSection.evaluate(element => element.getBoundingClientRect().top);

    await page.evaluate(() => {
      const loader = document.querySelector('#_canopy > .canopy-boot-loading-graphic');
      loader.dataset.canopyBootloaderVisibleAt = String(Date.now() - 200);
      window.setTimeout = window.__canopyNativeSetTimeout;
      window.__canopyBootloaderRemoval();
    });
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-fading-out/);
    await expect(firstSection).toHaveCSS('opacity', '1');
    const visibleTop = await firstSection.evaluate(element => element.getBoundingClientRect().top);
    expect(Math.abs(visibleTop - hiddenTop)).toBeLessThanOrEqual(1);
    await navigation;
    await expect(loader).toHaveCount(0);
  });

  test('waits before showing the bootloader', async ({ page }) => {
    await page.addInitScript(() => {
      const nativeSetTimeout = window.setTimeout.bind(window);
      window.__canopyBootloaderRevealTimers = [];
      window.setTimeout = (callback, delay, ...args) => {
        if (delay === 150) {
          window.__canopyBootloaderRevealTimers.push(() => callback(...args));
          return 1;
        }
        return nativeSetTimeout(callback, delay, ...args);
      };
    });
    const releaseCanopyScript = await holdCanopyScript(page);

    const navigation = page.goto('/United_States');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveCount(1);
    await expect(loader).not.toHaveClass(/canopy-boot-loading-graphic-visible/);
    await expect(loader).toHaveCSS('opacity', '0');
    await page.evaluate(() => window.__canopyBootloaderRevealTimers.forEach(callback => callback()));
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-visible/);

    releaseCanopyScript();

    await navigation;
    await expect(loader).toHaveCount(0);
  });

  test('keeps heading bootloader for shallow hosted paths', async ({ page }) => {
    await stubCanopyScript(page);

    await page.goto('/United_States/New_York');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveCount(1);
    await expect(loader).not.toHaveClass(/canopy-boot-loading-graphic-deep/);
    await expect(loader.locator('.canopy-loading-heading-line')).toBeVisible();
  });

  test('uses paragraph-only bootloader for hosted paths with at least three segments', async ({ page }) => {
    await stubCanopyScript(page);

    await page.goto('/United_States/New_York/Style_examples');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-deep/);
    await expect(loader.locator('.canopy-loading-heading-line')).toBeHidden();
    await expect(loader.locator('.canopy-loading-line')).toHaveCount(7);

    const visibleLineCount = await loader.locator('.canopy-loading-line').evaluateAll(elements => (
      elements.filter(element => getComputedStyle(element).display !== 'none').length
    ));
    expect(visibleLineCount).toBe(6);
  });

  test('counts hosted hash segments toward paragraph-only bootloader depth', async ({ page }) => {
    await stubCanopyScript(page);

    await page.goto('/United_States#New_York/Style_examples');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-deep/);
  });

  test('keeps nested placeholders behind the initial bootloader', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.stack));
    let releaseNestedTopic;
    const nestedTopicGate = new Promise(resolve => {
      releaseNestedTopic = resolve;
    });

    await page.route(/\/_data\/Style_examples[^/]*\.json$/i, async route => {
      await nestedTopicGate;
      await route.continue();
    });

    const navigation = page.goto('/United_States/New_York/Style_examples');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveClass(/canopy-boot-loading-graphic-visible/);
    await page.waitForTimeout(250);

    await expect(page.locator('.canopy-loading-section > .canopy-loading-graphic')).toHaveCount(1);
    const firstSection = page.locator('#_canopy > section.canopy-section').first();
    await expect(firstSection).toHaveCSS('opacity', '0');
    await expect(firstSection).toHaveCSS('pointer-events', 'none');
    await expect(loader).toBeVisible();

    releaseNestedTopic();
    await navigation;
    await expect(loader).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test('does not use paragraph-only bootloader for hash-routing depth', async ({ page }) => {
    await stubCanopyScript(page);

    await page.goto('/#/United_States/New_York/Style_examples');
    const loader = page.locator('#_canopy > .canopy-boot-loading-graphic');
    await expect(loader).toHaveCount(1);
    await expect(loader).not.toHaveClass(/canopy-boot-loading-graphic-deep/);
  });
});
