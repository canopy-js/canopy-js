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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitMessageAndContext(rawMessage) {
  const lines = String(rawMessage).split('\n');
  const isFrameLine = line =>
    /^\s*[> ]\s*\d+\s\|/.test(line) || // numbered frame lines with marker
    /^\s*\d+\s\|/.test(line) || // numbered frame lines without marker (subtopic header)
    /^\s*\|\s*\^/.test(line) || // caret line
    /^\s*\d*\s*\|\s*\.\.\./.test(line); // ellipsis spacer for subtopic headers
  const hasFrameMarkers = lines.some(isFrameLine) &&
    lines.some(line => /^\s*\|\s*\^/.test(line));

  if (!hasFrameMarkers) {
    return { message: rawMessage, context: '' };
  }

  let contextStart = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (isFrameLine(lines[i])) {
      contextStart = i;
    } else if (contextStart !== -1) {
      break;
    }
  }

  if (contextStart === -1) {
    return { message: rawMessage, context: '' };
  }

  let start = contextStart;
  for (let i = contextStart - 1; i >= 0; i--) {
    const prevLine = lines[i].trim();
    if (prevLine === '') {
      start = i;
      continue;
    }
    if (isFrameLine(prevLine)) {
      start = i;
      continue;
    }
    if (/\.(expl|bulk):\d+(?::\d+)?$/.test(prevLine)) {
      start = i;
      continue;
    }
    break;
  }

  const message = lines.slice(0, start).join('\n').trimEnd();
  const context = lines.slice(start).join('\n');
  return { message, context };
}

function writeHtmlError(error) {
  const rawMessage = stripAnsi(error?.message || error || 'Error getting error');
  const { message, context } = splitMessageAndContext(rawMessage);
  const bracketPattern = /\[\[[^\]\n]+]]|\[[^\]\n]+]/g;
  let safeMessage = escapeHtml(message).replace(/\n+/g, '<br><br>');
  safeMessage = safeMessage.replace(bracketPattern, match => `<code>${match}</code>`);
  const safeContext = context ? escapeHtml(context) : '';

  try {
    fs.mkdirSync('build', { recursive: true });
  } catch (_) {
    // ignore; writeFileSync will throw if we truly can't write
  }

  fs.writeFileSync(
    'build/index.html',
    `<style>
        p code {
          font-size: 85%;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 0 4px;
        }
        pre code {
          font-size: inherit;
          background: none;
          border: none;
          padding: 0;
        }
      </style>
      <h1 style="text-align: center;">Error building project</h1>
      <p style="font-size: 24px; width: 800px; margin: 20px auto; overflow-wrap: break-word; white-space: pre-wrap;">${safeMessage}</p>
      ${safeContext ? `<pre style="font-size: 87%; min-width: 800px; width: max-content; max-width: 100%; margin: 20px auto 20px auto; padding: 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; overflow-wrap: break-word; white-space: pre-wrap; font-family: "Courier New", Courier, monospace;"><code>${safeContext}</code></pre>` : ''}`
  );
}

function tryAndWriteHtmlError(func, options = {}) {
  if (options.onBuildError) return func(options); // caller will handle logging/translation
  try {
    return func(options);
  } catch(e) {
    const translated = typeof options.translateError === 'function' ? options.translateError(e, options) : e;
    if (options.error && translated?.stack) console.error(translated.stack);
    if (!options.error) console.error(chalk.red(translated.message || translated));
    writeHtmlError(translated, options);
    if (options.suppressThrow) return;
    throw translated;
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
