const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
const build = require('./build');
const { DefaultTopic } = require('./shared/fs-helpers');
const {
  staticBuildDirectory,
  electronBuildDirectory,
  electronAppDirectory
} = require('./shared/build_paths');

const templateDirectory = path.resolve(__dirname, '..', 'electron', 'template');

function electron(options = {}) {
  const script = selectedScript(options);

  build({ ...options, hashUrls: true });
  scaffoldElectronApp();
  warnIfMissingIcon();
  writePackageMetadata(new DefaultTopic());

  if (!script) {
    if (options.logging) console.log(`Wrote Electron scaffold to ${electronBuildDirectory}`);
    return;
  }

  if (options.install !== false && !fs.existsSync(path.join(electronBuildDirectory, 'node_modules'))) {
    run('npm', ['install'], electronBuildDirectory);
  }

  run('npm', ['run', script], electronBuildDirectory);
}

function selectedScript(options) {
  const scripts = ['start', 'package', 'make'].filter(script => options[script]);
  if (scripts.length > 1) throw new Error('Choose only one of --start, --package, or --make.');
  if (options.scaffoldOnly && scripts.length) throw new Error('--scaffold-only cannot be combined with --start, --package, or --make.');
  if (options.scaffoldOnly) return null;
  return scripts[0] || 'start';
}

function scaffoldElectronApp() {
  if (!fs.existsSync(templateDirectory)) throw new Error(`Missing Electron template: ${templateDirectory}`);

  fs.ensureDirSync(electronBuildDirectory);
  fs.copySync(templateDirectory, electronBuildDirectory, { overwrite: true });
  fs.removeSync(electronAppDirectory);
  fs.copySync(staticBuildDirectory, electronAppDirectory, { overwrite: true });
}

function warnIfMissingIcon() {
  const pngIconPath = path.join(electronAppDirectory, '_assets', 'electron-icon.png');
  const icnsIconPath = path.join(electronAppDirectory, '_assets', 'electron-icon.icns');

  if (!fs.existsSync(pngIconPath) && !fs.existsSync(icnsIconPath)) {
    console.warn('No Electron icon found at assets/electron-icon.png or assets/electron-icon.icns; generated app will use Electron defaults.');
  }
}

function writePackageMetadata(defaultTopic) {
  const packageJsonPath = path.join(electronBuildDirectory, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);
  const productName = productNameFor(defaultTopic.name);
  const packageName = packageNameFor(productName);

  packageJson.name = packageName;
  packageJson.productName = productName;
  packageJson.executableName = productName;

  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
  writePackageLockMetadata(packageName, packageJson.version);
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
