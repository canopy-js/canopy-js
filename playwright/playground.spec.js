import { test, expect } from './test-setup';

test.describe('Playground DOM', () => {
  test('Playground is working', async ({ page }) => {
    await page.goto('http://localhost:3006', { waitUntil: 'load' });

    const consoleEl = page.locator('#console');
    await expect(consoleEl).toHaveCount(1);
    await expect(consoleEl).not.toHaveClass(/error/);

    const header = page.locator('h1.canopy-header');
    await expect(header).toHaveCount(1);
    await expect(header).toHaveText('Playground');
  });
});