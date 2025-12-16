let fs = require('fs');
let Topic = require('./topic');
let Block = require('./block');
let chalk = require('chalk');
let path = require('path');
let { execSync } = require('child_process');
var stripAnsi = require('strip-ansi');

class DefaultTopic {
  constructor() {
    if (!fs.existsSync('canopy_default_topic')) throw new Error('There must be a default topic file present, try running "canopy init"');
    this.filePath = fs.readFileSync('canopy_default_topic').toString().trim();
    if (!this.filePath || !fs.existsSync(this.filePath)) {
      throw new Error(chalk.red(`Error: No topic file corresponds to the path given in canopy_default_topic: "${this.filePath.trim()}"`));
    }
    if (!fs.existsSync(this.filePath)) throw new Error(chalk.bgRed(`Default topic file does not exist: ${this.filePath}`));
    this.name = (new Block(fs.readFileSync(this.filePath).toString().trim())).key;
    if (!this.name) {
      throw new Error(chalk.red(`Error: The file referenced in canopy_default_topic lacks a valid topic key: ${this.filePath}`));
    }
    let categoryPath = this.filePath?.match(/topics\/(.*)\/[^/]+.expl/)[1];
    this.categoryPath = categoryPath && Topic.convertUnderscoresToSpaces(categoryPath);
    this.topicFileName = Topic.for(this.name).topicFileName;
    this.jsonFileName = Topic.for(this.name).jsonFileName;
  }
}

let canopyBinPath;
try {
  canopyBinPath = execSync('which canopy').toString().trim();
} catch {
  console.error(chalk.red('Could not find "canopy" in PATH'));
  process.exit(1);
}
let canopyLocation = process.env.CANOPY_LOCATION || path.dirname(path.dirname(fs.realpathSync(canopyBinPath)));

function tryDefaultTopic() {
  let defaultTopic = {};
  try {
    defaultTopic = new DefaultTopic();
  } catch(e) {
    if (!fs.existsSync('./topics')) {
      console.error(chalk.red("You are not in a Canopy project directory. Try canopy init to start project."));
    } else {
      console.error(chalk.red(e));
    }
    process.exit(1);
  }
  return defaultTopic;
}

function defaultTopic() {
  return new DefaultTopic();
}

function writeHtmlError(error) {
  const message = stripAnsi(error?.message || error || 'Error getting error')
    .replace(/\n+/g, '<br><br>');

  try {
    fs.mkdirSync('build', { recursive: true });
  } catch (_) {
    // ignore; writeFileSync will throw if we truly can't write
  }

  fs.writeFileSync(
    'build/index.html',
    `<h1 style="text-align: center;">Error building project</h1>
      <p style="font-size: 24px; width: 800px; margin: auto; overflow-wrap: break-word;">${message}</p>`
  );
}

function tryAndWriteHtmlError(func, options = {}) {
  try {
    return func(options);
  } catch(e) {
    writeHtmlError(e);
    if (options.suppressThrow) return;
    throw e;
  }
}

function getCategoryPathStrings() {
  const topicsDir = path.join(process.cwd(), 'topics');
  const output = execSync(`find "${topicsDir}" -type d`, { encoding: 'utf8' });

  return output
    .split('\n')
    .map(p => p.replace(/[\x00-\x1F\x7F]/g, '').trim()) // remove control chars
    .filter(p => p && p !== topicsDir)
    .map(p => path.relative(topicsDir, p).split(path.sep).join('/'))
    .filter(Boolean) // sometimes contains empty strings after relative edit
    .sort();
}

module.exports = { DefaultTopic, canopyLocation, tryDefaultTopic, writeHtmlError, tryAndWriteHtmlError, defaultTopic, getCategoryPathStrings };
