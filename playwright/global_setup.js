import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs-extra';

async function globalSetup(FullConfig) { // same as tear-down but sometimes teardown doesn't run leaving directories 
  fs.rmSync('playwright/hash_urls_and_prefix_static_test', { recursive: true, force: true });
  fs.rmSync('playwright/hash_urls_and_prefix_test', { recursive: true, force: true });
  fs.rmSync('playwright/hash_urls_test', { recursive: true, force: true });
  fs.rmSync('playwright/prefix_test', { recursive: true, force: true });
}

export default globalSetup;
