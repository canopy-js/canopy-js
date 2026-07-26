const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
const build = require('./build');
const { DefaultTopic } = require('./shared/fs-helpers');
const {
  offlineAssetsDirectory,
  staticBuildDirectory,
  electronBuildDirectory,
  electronAppDirectory
} = require('./shared/build_paths');

const templateDirectory = path.resolve(__dirname, '..', 'electron', 'template');

function electron(options = {}, dependencies = {}) {
  const script = selectedScript(options);
  const platform = dependencies.platform || process.platform;
  const runCommand = dependencies.runCommand || run;

  if (script === 'portable') assertPortablePlatform(platform);

  build({ ...options, hashUrls: true });
  scaffoldElectronApp();
  warnIfMissingIcon();
  const metadata = writePackageMetadata(new DefaultTopic());

  if (!script) {
    if (options.logging) console.log(`Wrote Electron scaffold to ${electronBuildDirectory}`);
    return;
  }

  if (options.install !== false && !electronDependenciesInstalled(script, platform)) {
    runCommand('npm', ['install'], electronBuildDirectory);
  }

  const expectedArtifactPath = expectedPortableArtifactPath(metadata.executableName, platform);
  if (script === 'portable') {
    if (expectedArtifactPath) fs.removeSync(expectedArtifactPath);
    if (options.logging) console.log(`Packaging ${portableBuildDescription(platform)}...`);
  }

  runCommand('npm', ['run', script], electronBuildDirectory);

  if (script === 'portable') {
    const artifactPath = portableArtifactPath(metadata.executableName, platform);
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Portable build completed without creating the expected artifact: ${artifactPath}`);
    }
    if (options.logging) console.log(`Created portable application:\n${artifactPath}`);
    return artifactPath;
  }
}

function selectedScript(options) {
  const scripts = ['start', 'package', 'make', 'portable'].filter(script => options[script]);
  if (scripts.length > 1) throw new Error('Choose only one of --start, --package, --make, or --portable.');
  if (options.scaffoldOnly && scripts.length) throw new Error('--scaffold-only cannot be combined with --start, --package, --make, or --portable.');
  if (options.scaffoldOnly) return null;
  return scripts[0] || 'start';
}

function assertPortablePlatform(platform) {
  if (!['win32', 'darwin', 'linux'].includes(platform)) {
    throw new Error(`Portable Electron builds are not supported on ${platform}. Supported platforms are Windows, macOS, and Linux.`);
  }
}

function electronDependenciesInstalled(script, platform) {
  const nodeModulesPath = path.join(electronBuildDirectory, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) return false;
  if (script === 'portable' && platform !== 'darwin') {
    return fs.existsSync(path.join(nodeModulesPath, 'electron-builder', 'package.json'));
  }
  return true;
}

function portableBuildDescription(platform) {
  if (platform === 'win32') return 'portable Windows x64 executable';
  if (platform === 'linux') return 'portable Linux AppImage';
  return 'portable macOS application';
}

function scaffoldElectronApp() {
  if (!fs.existsSync(templateDirectory)) throw new Error(`Missing Electron template: ${templateDirectory}`);

  fs.ensureDirSync(electronBuildDirectory);
  fs.copySync(templateDirectory, electronBuildDirectory, { overwrite: true });
  fs.removeSync(electronAppDirectory);
  fs.copySync(staticBuildDirectory, electronAppDirectory, { overwrite: true });

  if (fs.existsSync(offlineAssetsDirectory)) {
    fs.copySync(offlineAssetsDirectory, path.join(electronAppDirectory, '_assets'), { overwrite: true });
  }
}

function warnIfMissingIcon() {
  const icoIconPath = path.join(electronAppDirectory, '_assets', 'electron-icon.ico');
  const pngIconPath = path.join(electronAppDirectory, '_assets', 'electron-icon.png');
  const icnsIconPath = path.join(electronAppDirectory, '_assets', 'electron-icon.icns');

  if (!fs.existsSync(icoIconPath) && !fs.existsSync(pngIconPath) && !fs.existsSync(icnsIconPath)) {
    console.warn('No Electron icon found at assets/electron-icon.ico, assets/electron-icon.png, or assets/electron-icon.icns; generated app will use Electron defaults.');
  }
}

function writePackageMetadata(defaultTopic) {
  const packageJsonPath = path.join(electronBuildDirectory, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  const productName = productNameFor(defaultTopic.name);
  const packageName = packageNameFor(productName);
  const appIdName = packageName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'reader';
  const executableName = windowsFileBaseNameFor(productName);
  const portableIconPaths = portableIconPathsFor();

  packageJson.name = packageName;
  packageJson.productName = productName;
  packageJson.executableName = executableName;
  packageJson.build = {
    appId: `com.canopy.${appIdName}`,
    productName,
    executableName,
    asar: false,
    directories: {
      output: 'out/portable'
    },
    files: [
      'app/**/*',
      'src/**/*',
      'package.json'
    ],
    win: {
      artifactName: `${executableName}.exe`,
      target: [
        {
          target: 'portable',
          arch: ['x64']
        }
      ]
    },
    linux: {
      artifactName: `${executableName}.AppImage`,
      target: ['AppImage']
    }
  };

  if (portableIconPaths.win) packageJson.build.win.icon = portableIconPaths.win;
  if (portableIconPaths.linux) packageJson.build.linux.icon = portableIconPaths.linux;

  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
  writePackageLockMetadata(packageName, packageJson.version);
  return { packageName, productName, executableName };
}

function writePackageLockMetadata(packageName, version) {
  const packageLockPath = path.join(electronBuildDirectory, 'package-lock.json');
  if (!fs.existsSync(packageLockPath)) return;

  const packageLock = fs.readJsonSync(packageLockPath);
  packageLock.name = packageName;
  packageLock.version = version;
  if (packageLock.packages && packageLock.packages['']) {
    packageLock.packages[''].name = packageName;
    packageLock.packages[''].version = version;
  }

  fs.writeJsonSync(packageLockPath, packageLock, { spaces: 2 });
}

function productNameFor(name) {
  return String(name || 'Canopy Reader')
    .replace(/[><:|?*/\\!]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Canopy Reader';
}

function packageNameFor(productName) {
  return productName
    .toLowerCase()
    .replace(/['"“”‘’]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'canopy-electron-app';
}

function windowsFileBaseNameFor(productName) {
  let fileName = String(productName || 'Canopy Reader')
    .replace(/[\u0000-\u001f<>:"/\\|?*]/g, '')
    .replace(/[. ]+$/g, '')
    .trim();

  if (!fileName) fileName = 'Canopy Reader';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(fileName)) fileName += ' App';
  return fileName.slice(0, 120).replace(/[. ]+$/g, '') || 'Canopy Reader';
}

function portableIconPathsFor() {
  const winIconPaths = [
    'app/_assets/electron-icon.ico',
    'app/_assets/electron-icon.png'
  ];
  const linuxIconPath = 'app/_assets/electron-icon.png';
  return {
    win: winIconPaths.find(iconPath => fs.existsSync(path.join(electronBuildDirectory, iconPath))),
    linux: fs.existsSync(path.join(electronBuildDirectory, linuxIconPath)) ? linuxIconPath : undefined
  };
}

function expectedPortableArtifactPath(executableName, platform) {
  if (platform === 'win32') {
    return path.join(electronBuildDirectory, 'out', 'portable', `${executableName}.exe`);
  }
  if (platform === 'linux') {
    return path.join(electronBuildDirectory, 'out', 'portable', `${executableName}.AppImage`);
  }
}

function portableArtifactPath(executableName, platform) {
  const expectedArtifactPath = expectedPortableArtifactPath(executableName, platform);
  if (expectedArtifactPath) return expectedArtifactPath;

  const macAppPath = findNamedDirectory(path.join(electronBuildDirectory, 'out'), `${executableName}.app`);
  return macAppPath || path.join(electronBuildDirectory, 'out', '**', `${executableName}.app`);
}

function findNamedDirectory(rootPath, directoryName) {
  if (!fs.existsSync(rootPath)) return;

  const pendingPaths = [rootPath];
  while (pendingPaths.length) {
    const currentPath = pendingPaths.shift();
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const entryPath = path.join(currentPath, entry.name);
      if (entry.name === directoryName) return entryPath;
      if (!entry.name.endsWith('.app')) pendingPaths.push(entryPath);
    }
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.error) throw result.error;
  if (result.status) throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
}

module.exports = electron;
module.exports._private = {
  assertPortablePlatform,
  expectedPortableArtifactPath,
  portableArtifactPath,
  selectedScript,
  windowsFileBaseNameFor
};
