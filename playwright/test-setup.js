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

  // track pending JSON requests
  const pendingDataRequests = new Set();

  page.on('request', req => {
    if (req.url().includes('/_data/')) pendingDataRequests.add(req);
  });

  page.on('requestfinished', req => {
    pendingDataRequests.delete(req);
  });

  page.on('requestfailed', req => {
    pendingDataRequests.delete(req);

    const t = req.failure()?.errorText || '';
    if (ABORT_ERRORS.includes(t) || /abort|cancel/i.test(t)) return;
    console.log('requestfailed REAL', req.url(), req.failure());
  });

  // helper to wait for JSON fetches to settle
  page.waitForAllDataRequests = async () => {
    while (pendingDataRequests.size > 0) {
      await page.waitForTimeout(10);
    }
  };

  // wrap goto / reload to wait before navigating
  const originalGoto = page.goto.bind(page);
  const originalReload = page.reload.bind(page);

  async function waitForIdle() {
    await page.waitForAllDataRequests();
    try {
      await page.waitForLoadState('networkidle');
    } catch {
      // ignore if page not fully initialized yet
    }
  }

  page.goto = async (...args) => {
    await waitForIdle();
    return originalGoto(...args);
  };

  page.reload = async (...args) => {
    await waitForIdle();
    return originalReload(...args);
  };

  // canonical start state
  await page.goto('/United_States');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.waitForFunction(
    () => localStorage.length === 0 && sessionStorage.length === 0
  );
});
