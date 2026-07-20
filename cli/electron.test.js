const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const { staticBuildPath, electronBuildPath, electronAppPath } = require('./shared/build_paths');

function writeProjectFile(filePath, contents) {
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
}

function writeCanopyAssetFixture(canopyLocation) {
  writeProjectFile(path.join(canopyLocation, 'dist', '_canopy.js'), '// test Canopy.js asset\n');
}

function withElectronProject(runTest) {
  const originalCwd = process.cwd();
  const originalCanopyLocation = process.env.CANOPY_LOCATION;
  const originalWarn = console.warn;
  console.warn = jest.fn();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-electron-'));
  const canopyLocation = path.join(tmpDir, 'canopy-fixture');

  try {
    writeCanopyAssetFixture(canopyLocation);
    process.env.CANOPY_LOCATION = canopyLocation;
    jest.resetModules();
    const electron = require('./electron');

    process.chdir(tmpDir);

    writeProjectFile('topics/My App/My App.expl', 'My App: Hello from Electron.\n');
    fs.writeFileSync('canopy_default_topic', 'topics/My App/My App.expl');

    runTest({ electron });
  } finally {
    if (originalCanopyLocation === undefined) {
      delete process.env.CANOPY_LOCATION;
    } else {
      process.env.CANOPY_LOCATION = originalCanopyLocation;
    }
    jest.resetModules();
    console.warn = originalWarn;
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('electron scaffold', () => {
  test('creates a self-contained Electron app scaffold from the static build', () => {
    withElectronProject(({ electron }) => {
      electron({ logging: false, scaffoldOnly: true });

      expect(fs.existsSync(electronBuildPath('package.json'))).toBe(true);
      expect(fs.existsSync(electronBuildPath('forge.config.js'))).toBe(true);
      expect(fs.existsSync(electronBuildPath('src', 'index.js'))).toBe(true);
      expect(fs.existsSync(electronAppPath('index.html'))).toBe(true);
      expect(fs.existsSync(electronAppPath('_canopy.js'))).toBe(true);
      expect(fs.existsSync(electronAppPath('_data'))).toBe(true);

      const packageJson = fs.readJsonSync(electronBuildPath('package.json'));
      expect(packageJson.name).toBe('my-app');
      expect(packageJson.productName).toBe('My App');
      expect(packageJson.devDependencies.electron).toBeDefined();

      const packageLock = fs.readJsonSync(electronBuildPath('package-lock.json'));
      expect(packageLock.name).toBe('my-app');
      expect(packageLock.packages[''].name).toBe('my-app');
      expect(console.warn).toHaveBeenCalledWith('No Electron icon found at assets/electron-icon.png or assets/electron-icon.icns; generated app will use Electron defaults.');
    });
  });

  test('copies nested Electron-only assets after static assets without adding them to the static build', () => {
    withElectronProject(({ electron }) => {
      writeProjectFile('assets/offline/shared.txt', 'static asset\n');
      writeProjectFile('electron-assets/offline/Hisbonen-onboarding.mp4', 'electron-only video\n');
      writeProjectFile('electron-assets/offline/shared.txt', 'electron override\n');

      electron({ logging: false, scaffoldOnly: true });

      expect(fs.readFileSync(electronAppPath('_assets', 'offline', 'Hisbonen-onboarding.mp4'), 'utf8')).toBe('electron-only video\n');
      expect(fs.existsSync(staticBuildPath('_assets', 'offline', 'Hisbonen-onboarding.mp4'))).toBe(false);
      expect(fs.readFileSync(staticBuildPath('_assets', 'offline', 'shared.txt'), 'utf8')).toBe('static asset\n');
      expect(fs.readFileSync(electronAppPath('_assets', 'offline', 'shared.txt'), 'utf8')).toBe('electron override\n');
    });
  });

  test('allows projects without an electron-assets directory', () => {
    withElectronProject(({ electron }) => {
      expect(() => electron({ logging: false, scaffoldOnly: true })).not.toThrow();
      expect(fs.existsSync(electronAppPath('index.html'))).toBe(true);
    });
  });
});
