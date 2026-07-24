const { test, expect } = require('./test-setup');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { pathToFileURL } = require('url');
const { singleFileBuildPath } = require('../cli/shared/build_paths');
const build = require('../cli/build');

let projectDir;
const sourceProjectDir = path.join(__dirname, 'test_project');
const defaultTopic = 'United_States';
let htmlPath;

test.describe('single-file build', () => {
  test.beforeAll(() => {
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-single-file-'));
    htmlPath = path.join(projectDir, singleFileBuildPath(`${defaultTopic}.html`));
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

test('shows an explanatory placeholder for an asset that is too large to embed', async ({ page }) => {
  const oversizedProjectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-single-file-oversized-'));
  const oversizedDefaultTopic = 'Oversized';
  const oversizedHtmlPath = path.join(
    oversizedProjectDir,
    singleFileBuildPath(`${oversizedDefaultTopic}.html`)
  );
  const originalCwd = process.cwd();

  try {
    fs.mkdirSync(path.join(oversizedProjectDir, 'topics', oversizedDefaultTopic), { recursive: true });
    fs.mkdirSync(path.join(oversizedProjectDir, 'assets'), { recursive: true });
    fs.writeFileSync(
      path.join(oversizedProjectDir, 'topics', oversizedDefaultTopic, `${oversizedDefaultTopic}.expl`),
      'Oversized: ![Oversized map](/_assets/oversized-map.png)\n'
    );
    fs.writeFileSync(
      path.join(oversizedProjectDir, 'canopy_default_topic'),
      `topics/${oversizedDefaultTopic}/${oversizedDefaultTopic}.expl`
    );
    fs.writeFileSync(
      path.join(oversizedProjectDir, 'assets', 'oversized-map.png'),
      'larger than the test threshold'
    );

    process.chdir(oversizedProjectDir);
    build({ file: true, hashUrls: true, logging: false, maxBase64AssetBytes: 1 });
    process.chdir(originalCwd);

    await page.goto(
      pathToFileURL(oversizedHtmlPath).toString() + `#/${oversizedDefaultTopic}`
    );

    const placeholder = page.getByAltText('Oversized map');
    await expect(placeholder).toBeVisible();

    const source = await placeholder.getAttribute('src');
    expect(source).toMatch(/^data:image\/svg\+xml;base64,/);

    const svg = Buffer.from(source.split(',')[1], 'base64').toString('utf8');
    expect(svg).toContain('Asset unavailable offline');
    expect(svg).toContain('_assets/oversized-map.png is too large to include in single-file offline mode.');

    await expect.poll(
      () => placeholder.evaluate(image =>
        image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
      )
    ).toBe(true);
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(oversizedProjectDir, { recursive: true, force: true });
  }
});
