const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const build = require('./build');
const { staticBuildPath } = require('./shared/build_paths');

function writeProjectFile(filePath, contents) {
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
}

describe('build assets', () => {
  test('refreshes existing build assets on a regular build', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-build-assets-'));

    try {
      process.chdir(tmpDir);

      writeProjectFile('topics/Idaho/Idaho.expl', 'Idaho: Idaho is a state.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/Idaho/Idaho.expl');
      writeProjectFile('assets/custom.js', 'window.assetVersion = "old";\n');

      build({ logging: false });

      fs.writeFileSync('assets/custom.js', 'window.assetVersion = "new";\n');

      build({ logging: false });

      expect(fs.readFileSync(staticBuildPath('_assets', 'custom.js'), 'utf8')).toBe('window.assetVersion = "new";\n');
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
