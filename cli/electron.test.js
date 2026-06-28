const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const { electronBuildPath, electronAppPath } = require('./shared/build_paths');

function writeProjectFile(filePath, contents) {
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
}

function writeCanopyAssetFixture(canopyLocation) {
  writeProjectFile(path.join(canopyLocation, 'dist', '_canopy.js'), '// test Canopy.js asset\n');
}

describe('electron scaffold', () => {
  test('creates a self-contained Electron app scaffold from the static build', () => {
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
  });
});
