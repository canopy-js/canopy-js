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
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(msg.text());
  });

  page.on('pageerror', err => {
    console.error('Page Error:', err.message);
  });

  page.on('requestfailed', req => {
    const t = req.failure()?.errorText || '';
    if (ABORT_ERRORS.includes(t) || /abort|cancel/i.test(t)) return;
    console.log('requestfailed REAL', req.url(), req.failure());
  });

  await page.goto('/United_States');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.waitForFunction(() =>
    localStorage.length === 0 && sessionStorage.length === 0
  );
});