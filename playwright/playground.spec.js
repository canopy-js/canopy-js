import { test, expect } from './test-setup';

test.describe('Playground DOM', () => {
  const shortMenuSizingText = `[Menu sizing]

* Menu sizing:
Short playground menu:
===
> [[One]]
> [[Two]]
> [[Three]]
===

One: One.

Two: Two.

Three: Three.`;

  const thirdPillMenuSizingText = `[Menu sizing]

* Menu sizing:
Third pill playground menu:
===
> [[Third pill target|This is 1/3 pill????]]
> [[Four]]
> [[Five]]
> [[Six]]
===

Third pill target: Third pill target.

Four: Four.

Five: Five.

Six: Six.`;

  test('Playground is working', async ({ page }) => {
    await page.goto('http://localhost:3006', { waitUntil: 'load' });

    const consoleEl = page.locator('#console');
    await expect(consoleEl).toHaveCount(1);
    await expect(consoleEl).not.toHaveClass(/error/);

    const header = page.locator('h1.canopy-header');
    await expect(header).toHaveCount(1);
    await expect(header).toHaveText('Playground');
  });

  test('Playground menu buttons use the expected size classes', async ({ page }) => {
    await page.goto('http://localhost:3006', { waitUntil: 'load' });
    await expect(page.locator('h1.canopy-header')).toHaveText('Playground');

    await page.locator('#editor').fill(shortMenuSizingText);
    await page.locator('#console').click();
    await expect(page.locator('h1.canopy-header')).toHaveText('Menu sizing');

    const menus = page.locator('#_canopy .canopy-menu');
    await expect(menus).toHaveCount(1);
    await expect(menus.nth(0)).toHaveClass(/canopy-quarter-pill/);

    await page.locator('#editor').fill(thirdPillMenuSizingText);
    await page.locator('#console').click();
    await expect(page.locator('h1.canopy-header')).toHaveText('Menu sizing');
    await expect(menus).toHaveCount(1);
    await expect(menus.nth(0)).toHaveClass(/canopy-third-pill/);

    const overflowingCells = await page.locator('#_canopy').evaluate(canopyContainer => {
      return [...canopyContainer.querySelectorAll('.canopy-menu-cell')]
        .map((cell, index) => {
          if (cell.style.opacity === '0') return null;

          const contentContainer = cell.querySelector('.canopy-menu-content-container');
          if (!contentContainer) return null;

          const contentRect = contentContainer.getBoundingClientRect();
          const cellRect = cell.getBoundingClientRect();

          const overflowing =
            contentRect.left < cellRect.left - 0.5 ||
            contentRect.right > cellRect.right + 0.5 ||
            contentRect.top < cellRect.top - 0.5 ||
            contentRect.bottom > cellRect.bottom + 0.5;

          return overflowing ? { index, text: cell.textContent.trim() } : null;
        })
        .filter(Boolean);
    });

    expect(overflowingCells).toEqual([]);
  });
});
