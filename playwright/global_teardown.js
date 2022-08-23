import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs-extra';

async function globalTeardown(FullConfig) {
  fs.rmSync('playwright/hash_urls_and_prefix_test', { recursive: true, force: true });
  fs.rmSync('playwright/hash_urls_test', { recursive: true, force: true });
  fs.rmSync('playwright/prefix_test', { recursive: true, force: true });
}

export default globalTeardown;
