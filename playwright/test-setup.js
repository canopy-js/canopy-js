import { test as base } from '@playwright/test';

export function logBrowserErrors(message) {
  if (message.type() === 'error') {
    console.error(message.text());
  }
}

const ABORT_ERRORS = [
  'net::ERR_ABORTED',
  'NS_BINDING_ABORTED',
  'Cancelled',
  'canceled',
];

export const test = base;
export { expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // mirror console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(msg.text());
  });

  // surface page errors
  page.on('pageerror', err => {
    console.error('Page Error:', err.message);
  });

  // canonical start state for hosted tests
  if (page.url().startsWith('http')) {
    await page.goto('/United_States');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.waitForFunction(
      () => localStorage.length === 0 && sessionStorage.length === 0
    );
  }
});
