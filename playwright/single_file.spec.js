const { test, expect } = require('./test-setup');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { pathToFileURL } = require('url');

let projectDir;
const sourceProjectDir = path.join(__dirname, 'test_project');
const defaultTopic = 'United_States';
let htmlPath;

test.describe('single-file build', () => {
  test.beforeAll(() => {
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-single-file-'));
    htmlPath = path.join(projectDir, 'build', '_file', `${defaultTopic}.html`);
    fs.cpSync(sourceProjectDir, projectDir, { recursive: true, filter: src => !src.includes('.canopy_bulk_backups') });
    execSync('canopy build --hash-urls --file', { cwd: projectDir, stdio: 'ignore' });
  });

  test.afterAll(() => {
    fs.rmSync(projectDir, { recursive: true, force: true });
  });

  test('renders via file:// with no errors', async ({ page }) => {
    const fileUrl = pathToFileURL(htmlPath).toString() + `#/${defaultTopic}`;
    const pageErrors = [];
    const consoleErrors = [];

    page.on('pageerror', (err) => pageErrors.push(err));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(fileUrl);

    await expect(page.locator('h1')).toHaveText(/United States/);
    await page.getByRole('link', { name: 'New York' }).click();
    await expect(page.url()).toContain('#/United_States/New_York');

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
