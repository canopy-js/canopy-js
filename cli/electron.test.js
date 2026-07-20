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

    runTest({ electron, tmpDir });
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
      expect(packageJson.scripts.portable).toBe('node scripts/portable.js');
      expect(fs.existsSync(electronBuildPath('scripts', 'portable.js'))).toBe(true);
      expect(packageJson.build.win.artifactName).toBe('My App.exe');
      expect(packageJson.build.asar).toBe(false);
      expect(packageJson.build.win.target).toEqual([{ target: 'portable', arch: ['x64'] }]);
      expect(packageJson.build.linux).toEqual({
        artifactName: 'My App.AppImage',
        target: ['AppImage']
      });
      expect(console.warn).toHaveBeenCalledWith('No Electron icon found at assets/electron-icon.ico, assets/electron-icon.png, or assets/electron-icon.icns; generated app will use Electron defaults.');
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

  test('configures a Windows icon for the portable executable and taskbar window', () => {
    withElectronProject(({ electron }) => {
      writeProjectFile('assets/electron-icon.ico', 'test icon\n');

      electron({ logging: false, scaffoldOnly: true });

      const packageJson = fs.readJsonSync(electronBuildPath('package.json'));
      expect(packageJson.build.win.icon).toBe('app/_assets/electron-icon.ico');
      expect(fs.existsSync(electronAppPath('_assets', 'electron-icon.ico'))).toBe(true);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});

describe('electron build selection', () => {
  test('maps each supported platform to its portable packaging command', () => {
    const { commandFor } = require('../electron/template/scripts/portable');

    expect(commandFor('win32')).toEqual(['electron-builder', ['--win', 'portable', '--x64']]);
    expect(commandFor('linux')).toEqual(['electron-builder', ['--linux', 'AppImage']]);
    expect(commandFor('darwin')).toEqual(['electron-forge', ['package']]);
    expect(commandFor('freebsd')).toBeUndefined();
  });

  test('selects portable without changing package and make behavior', () => {
    const { selectedScript } = require('./electron')._private;

    expect(selectedScript({ portable: true })).toBe('portable');
    expect(selectedScript({ package: true })).toBe('package');
    expect(selectedScript({ make: true })).toBe('make');
    expect(selectedScript({})).toBe('start');
  });

  test.each([
    [{ make: true, portable: true }, 'Choose only one'],
    [{ package: true, portable: true }, 'Choose only one'],
    [{ scaffoldOnly: true, portable: true }, '--scaffold-only cannot be combined']
  ])('rejects conflicting output flags', (options, message) => {
    const { selectedScript } = require('./electron')._private;
    expect(() => selectedScript(options)).toThrow(message);
  });

  test('fails clearly before building on unsupported platforms', () => {
    withElectronProject(({ electron }) => {
      expect(() => electron({ logging: false, portable: true }, { platform: 'freebsd' }))
        .toThrow('Supported platforms are Windows, macOS, and Linux');
      expect(fs.existsSync(electronBuildPath())).toBe(false);
    });
  });

  test('builds and confirms a named Windows portable executable', () => {
    withElectronProject(({ electron }) => {
      const runCommand = jest.fn((command, args, cwd) => {
        if (args.join(' ') === 'run portable') {
          writeProjectFile(path.join(cwd, 'out', 'portable', 'My App.exe'), 'portable executable\n');
        }
      });

      const artifactPath = electron(
        { logging: false, portable: true, install: false },
        { platform: 'win32', runCommand }
      );

      expect(runCommand).toHaveBeenCalledTimes(1);
      expect(runCommand).toHaveBeenCalledWith('npm', ['run', 'portable'], electronBuildPath());
      expect(artifactPath).toBe(electronBuildPath('out', 'portable', 'My App.exe'));
      expect(fs.existsSync(artifactPath)).toBe(true);
    });
  });

  test('builds and confirms a named Linux AppImage', () => {
    withElectronProject(({ electron }) => {
      const runCommand = jest.fn((command, args, cwd) => {
        if (args.join(' ') === 'run portable') {
          writeProjectFile(path.join(cwd, 'out', 'portable', 'My App.AppImage'), 'portable application\n');
        }
      });

      const artifactPath = electron(
        { logging: false, portable: true, install: false },
        { platform: 'linux', runCommand }
      );

      expect(runCommand).toHaveBeenCalledWith('npm', ['run', 'portable'], electronBuildPath());
      expect(artifactPath).toBe(electronBuildPath('out', 'portable', 'My App.AppImage'));
      expect(fs.existsSync(artifactPath)).toBe(true);
    });
  });

  test('uses the normal packaged app as the macOS portable application', () => {
    withElectronProject(({ electron }) => {
      fs.ensureDirSync(electronBuildPath('node_modules'));
      const runCommand = jest.fn((command, args, cwd) => {
        if (args.join(' ') === 'run portable') {
          fs.ensureDirSync(path.join(cwd, 'out', 'My App-darwin-arm64', 'My App.app'));
        }
      });

      const artifactPath = electron(
        { logging: false, portable: true },
        { platform: 'darwin', runCommand }
      );

      expect(runCommand).toHaveBeenCalledTimes(1);
      expect(runCommand).toHaveBeenCalledWith('npm', ['run', 'portable'], electronBuildPath());
      expect(artifactPath).toBe(electronBuildPath('out', 'My App-darwin-arm64', 'My App.app'));
      expect(fs.existsSync(artifactPath)).toBe(true);
    });
  });

  test('installs Electron Builder when an older scaffold has node_modules without it', () => {
    withElectronProject(({ electron }) => {
      fs.ensureDirSync(electronBuildPath('node_modules'));
      const runCommand = jest.fn((command, args, cwd) => {
        if (args.join(' ') === 'run portable') {
          writeProjectFile(path.join(cwd, 'out', 'portable', 'My App.exe'), 'portable executable\n');
        }
      });

      electron(
        { logging: false, portable: true },
        { platform: 'win32', runCommand }
      );

      expect(runCommand.mock.calls.map(call => call[1])).toEqual([
        ['install'],
        ['run', 'portable']
      ]);
    });
  });

  test('fails if the portable builder does not create the expected artifact', () => {
    withElectronProject(({ electron }) => {
      expect(() => electron(
        { logging: false, portable: true, install: false },
        { platform: 'win32', runCommand: jest.fn() }
      )).toThrow('Portable build completed without creating the expected artifact');
    });
  });

  test('sanitizes portable executable names for Windows', () => {
    const { windowsFileBaseNameFor } = require('./electron')._private;

    expect(windowsFileBaseNameFor('Hisbonen')).toBe('Hisbonen');
    expect(windowsFileBaseNameFor('A: Topic? ')).toBe('A Topic');
    expect(windowsFileBaseNameFor('CON')).toBe('CON App');
  });
});
