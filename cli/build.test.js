const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const { staticBuildPath } = require('./shared/build_paths');

function writeProjectFile(filePath, contents) {
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
}

function writeCanopyAssetFixture(canopyLocation) {
  writeProjectFile(path.join(canopyLocation, 'dist', '_canopy.js'), '// test Canopy.js asset\n');
}

describe('build assets', () => {
  test('refreshes existing build assets on a regular build', () => {
    const originalCwd = process.cwd();
    const originalCanopyLocation = process.env.CANOPY_LOCATION;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-build-assets-'));
    const canopyLocation = path.join(tmpDir, 'canopy-fixture');

    try {
      writeCanopyAssetFixture(canopyLocation);
      process.env.CANOPY_LOCATION = canopyLocation;
      jest.resetModules();
      const build = require('./build');

      process.chdir(tmpDir);

      writeProjectFile('topics/Idaho/Idaho.expl', 'Idaho: Idaho is a state.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/Idaho/Idaho.expl');
      writeProjectFile('assets/custom.js', 'window.assetVersion = "old";\n');

      build({ logging: false });

      fs.writeFileSync('assets/custom.js', 'window.assetVersion = "new";\n');

      build({ logging: false });

      expect(fs.readFileSync(staticBuildPath('_assets', 'custom.js'), 'utf8')).toBe('window.assetVersion = "new";\n');
    } finally {
      if (originalCanopyLocation === undefined) {
        delete process.env.CANOPY_LOCATION;
      } else {
        process.env.CANOPY_LOCATION = originalCanopyLocation;
      }
      jest.resetModules();
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
