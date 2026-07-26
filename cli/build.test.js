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
  test('keeps offline assets out of static output and inlines them in single-file output', () => {
    const originalCwd = process.cwd();
    const originalCanopyLocation = process.env.CANOPY_LOCATION;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-build-offline-assets-'));
    const canopyLocation = path.join(tmpDir, 'canopy-fixture');
    let statSyncSpy;

    try {
      writeCanopyAssetFixture(canopyLocation);
      process.env.CANOPY_LOCATION = canopyLocation;
      jest.resetModules();
      const build = require('./build');
      const buildFs = require('fs-extra');

      process.chdir(tmpDir);

      writeProjectFile(
        'topics/Idaho/Idaho.expl',
        'Idaho: ![Onboarding video](/_assets/offline/onboarding.mp4)\n'
      );
      fs.writeFileSync('canopy_default_topic', 'topics/Idaho/Idaho.expl');
      writeProjectFile(
        'assets/head.html',
        [
          '<meta data-onboarding-video="/_assets/offline/onboarding.mp4">',
          '<meta data-collision-video="/_assets/offline/collision.mp4">',
          '<meta data-regular-asset="/_assets/regular.png">',
          '<meta data-oversized-video="/_assets/offline/oversized.mp4">',
          ''
        ].join('\n')
      );
      writeProjectFile('assets/regular.png', 'regular asset');
      writeProjectFile('assets/offline/collision.mp4', 'static collision');
      writeProjectFile('offline-assets/offline/onboarding.mp4', 'preferred video');
      writeProjectFile('offline-assets/offline/collision.mp4', 'preferred collision');
      writeProjectFile('offline-assets/offline/oversized.mp4', 'oversized fixture');

      const oversizedAssetPath = path.resolve('offline-assets', 'offline', 'oversized.mp4');
      const originalStatSync = buildFs.statSync;
      statSyncSpy = jest.spyOn(buildFs, 'statSync').mockImplementation(filePath => {
        const stat = originalStatSync(filePath);
        if (path.resolve(filePath) !== oversizedAssetPath) return stat;

        return new Proxy(stat, {
          get(target, property) {
            if (property === 'size') return build._test.MAX_BASE64_ASSET_BYTES + 1;
            const value = Reflect.get(target, property);
            return typeof value === 'function' ? value.bind(target) : value;
          }
        });
      });

      build({ file: true, hashUrls: true, logging: false });
      statSyncSpy.mockRestore();
      statSyncSpy = null;

      const html = fs.readFileSync(path.join('build', 'file', 'Idaho.html'), 'utf8');
      const preferredVideoDataUri = `data:video/mp4;base64,${Buffer.from('preferred video').toString('base64')}`;
      const preferredCollisionDataUri = `data:video/mp4;base64,${Buffer.from('preferred collision').toString('base64')}`;
      const regularAssetDataUri = `data:image/png;base64,${Buffer.from('regular asset').toString('base64')}`;
      const oversizedPlaceholder = build._test.offlineAssetPlaceholderDataUri('_assets/offline/oversized.mp4');

      expect(fs.existsSync(staticBuildPath('_assets', 'offline', 'onboarding.mp4'))).toBe(false);
      expect(fs.readFileSync(staticBuildPath('_assets', 'offline', 'collision.mp4'), 'utf8')).toBe('static collision');
      expect(fs.readFileSync(staticBuildPath('_assets', 'regular.png'), 'utf8')).toBe('regular asset');
      expect(html).toContain(`data-onboarding-video="${preferredVideoDataUri}"`);
      expect(html).toContain(`"resourceUrl":"${preferredVideoDataUri}"`);
      expect(html).toContain(preferredCollisionDataUri);
      expect(html).not.toContain(`data:video/mp4;base64,${Buffer.from('static collision').toString('base64')}`);
      expect(html).toContain(regularAssetDataUri);
      expect(html).toContain(oversizedPlaceholder);
      expect(html).not.toContain('/_assets/offline/onboarding.mp4');
      expect(html).not.toContain('/_assets/offline/collision.mp4');
      expect(html).not.toContain('/_assets/offline/oversized.mp4');
    } finally {
      statSyncSpy?.mockRestore();
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

  test('uses an explanatory offline placeholder when an asset is too large to base64 encode', () => {
    const originalCwd = process.cwd();
    const originalCanopyLocation = process.env.CANOPY_LOCATION;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-build-oversized-asset-'));
    const canopyLocation = path.join(tmpDir, 'canopy-fixture');
    let statSyncSpy;

    try {
      writeCanopyAssetFixture(canopyLocation);
      process.env.CANOPY_LOCATION = canopyLocation;
      jest.resetModules();
      const build = require('./build');
      const buildFs = require('fs-extra');

      process.chdir(tmpDir);

      writeProjectFile(
        'topics/Idaho/Idaho.expl',
        'Idaho: ![A very large map](/_assets/large-map.png)\n'
      );
      fs.writeFileSync('canopy_default_topic', 'topics/Idaho/Idaho.expl');
      writeProjectFile('assets/large-map.png', 'small test fixture');

      const oversizedAssetPath = path.resolve(staticBuildPath('_assets', 'large-map.png'));
      const originalStatSync = buildFs.statSync;
      statSyncSpy = jest.spyOn(buildFs, 'statSync').mockImplementation(filePath => {
        const stat = originalStatSync(filePath);
        if (path.resolve(filePath) !== oversizedAssetPath) return stat;

        return new Proxy(stat, {
          get(target, property) {
            if (property === 'size') return build._test.MAX_BASE64_ASSET_BYTES + 1;
            const value = Reflect.get(target, property);
            return typeof value === 'function' ? value.bind(target) : value;
          }
        });
      });

      build({ file: true, hashUrls: true, logging: false });
      statSyncSpy.mockRestore();
      statSyncSpy = null;

      const html = fs.readFileSync(path.join('build', 'file', 'Idaho.html'), 'utf8');
      const placeholder = build._test.offlineAssetPlaceholderDataUri('_assets/large-map.png');

      expect(html).toContain(placeholder);
      expect(Buffer.from(placeholder.split(',')[1], 'base64').toString('utf8')).toContain(
        'Asset unavailable offline'
      );
      expect(html).not.toContain(Buffer.from('small test fixture').toString('base64'));
    } finally {
      statSyncSpy?.mockRestore();
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

  test('positions the bootloader heading at the page heading offset', () => {
    const originalCwd = process.cwd();
    const originalCanopyLocation = process.env.CANOPY_LOCATION;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-build-bootloader-'));
    const canopyLocation = path.join(tmpDir, 'canopy-fixture');

    try {
      writeCanopyAssetFixture(canopyLocation);
      process.env.CANOPY_LOCATION = canopyLocation;
      jest.resetModules();
      const build = require('./build');

      process.chdir(tmpDir);

      writeProjectFile('topics/Idaho/Idaho.expl', 'Idaho: Idaho is a state.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/Idaho/Idaho.expl');

      build({ logging: false });

      const html = fs.readFileSync(staticBuildPath('index.html'), 'utf8');
      expect(html).toContain('justify-content: flex-start;');
      expect(html).toContain('gap: 20px;');
      expect(html).toContain('filter: blur(2.9px);');
      expect(html).toContain('height: 24px;');
      expect(html).toContain('left: 50%;');
      expect(html).toContain('margin: 0;');
      expect(html).toContain('padding: 0 30px 22px;');
      expect(html).toContain('position: fixed;');
      expect(html).toContain('top: 44px;');
      expect(html).toContain('transform: translateX(-50%);');
      expect(html).toContain('#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-visible {');
      expect(html).toContain('animation: canopy-boot-loading-fade-out 165ms ease forwards;');
      expect(html).toContain('.canopy-boot-loading-graphic:not(.canopy-boot-loading-graphic-fading-out) ~ section.canopy-section {');
      expect(html).toContain('opacity: 0 !important;');
      expect(html).toContain('pointer-events: none;');
      expect(html).toContain('margin: 0 auto 15px;');
      expect(html).toContain('#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep {');
      expect(html).toContain('padding-top: 42px;');
      expect(html).toContain("if (window.location.protocol === 'file:') return;");
      expect(html).toContain("const route = window.location.pathname + (hash.startsWith('#/') ? '' : hash);");
      expect(html).toContain('route.split(/[\\/#]/).filter(Boolean)');
      expect(html).toContain('pathSegments.length >= 3');
      expect(html).toContain("classList.add('canopy-boot-loading-graphic-deep')");
      expect(html).toContain('loader.dataset.canopyBootloaderVisibleAt = String(Date.now());');
      expect(html).toContain("classList.add('canopy-boot-loading-graphic-visible')");
      expect(html).toContain('}, 150);');
      expect(html).toContain('#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(n+6) {');
      expect(html).toContain('#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-line:nth-of-type(n+6) {');
      expect(html).toContain('margin-top: 16px;');
      expect(html).toContain('width: 110%;');
      expect(html).toContain('#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line::after {');
      expect(html).toContain('animation: canopy-boot-loading-line-shimmer var(--canopy-boot-loading-line-duration) cubic-bezier(0.45, 0, 0.55, 1) infinite;');
      expect(html).toContain('animation-delay: var(--canopy-boot-loading-line-delay);');
      expect(html).toContain('--canopy-boot-loading-line-duration: 3400ms;');
      expect(html).toContain('--canopy-boot-loading-line-sweep: 74%;');
      expect(html).toContain('0% { opacity: 0; transform: translateX(var(--canopy-boot-loading-line-start)); }');
      expect(html).toContain('100% { opacity: 0; transform: translateX(var(--canopy-boot-loading-line-stop)); }');
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
