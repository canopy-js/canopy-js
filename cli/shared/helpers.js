let fs = require('fs');
let Topic = require('./topic');
let Paragraph = require('./paragraph');
let { getRecursiveSubdirectoryFiles } = require('../bulk/helpers');
let chalk = require('chalk');
let path = require('path');
let shell = require('shelljs');
var stripAnsi = require('strip-ansi');

class DefaultTopic {
  constructor() {
    if (!fs.existsSync('canopy_default_topic')) throw new Error('There must be a default topic file present, try running "canopy init"');
    this.filePath = fs.readFileSync('canopy_default_topic').toString().trim();
    if (!this.filePath || !fs.existsSync(this.filePath)) {
      throw new Error(chalk.red(`Error: No topic file corresponds to the path given in canopy_default_topic: ${this.filePath.trim()}`));
    }
    if (!fs.existsSync(this.filePath)) throw new Error(chalk.bgRed(`Default topic file does not exist: ${this.filePath}`));
    this.name = (new Paragraph(fs.readFileSync(this.filePath).toString().trim())).key
    if (!this.name) {
      throw new Error(chalk.red(`Error: The file referenced in canopy_default_topic lacks a valid topic key: ${this.filePath}`));
    }
    let categoryPath = this.filePath?.match(/topics\/(.*)\/[^\/]+.expl/)[1];
    this.categoryPath = categoryPath && Topic.convertUnderscoresToSpaces(categoryPath);
    this.fileName = Topic.for(this.name).fileName;
  }
}

let canopyLocation = process.env.CANOPY_LOCATION || path.dirname(path.dirname(fs.realpathSync(shell.which('canopy').stdout)));

function displaySegment(topic, subtopic) {
  if (topic.mixedCase === subtopic.mixedCase) {
    return `[${topic.mixedCase}]`;
  } else {
    return `[${subtopic.mixedCase} (${topic.mixedCase})]`;
  }
}

function tryDefaultTopic() {
  let defaultTopic = {};
  try { defaultTopic = new DefaultTopic(); } catch {}
  return defaultTopic;
}

function splitOnPipes(string) { // ignore pipes that are escaped or inside links eg [[a|b]]
  let oneOpenBracket = false;
  let oneCloseBracket = false;
  let openLink = false;
  let escape = false;
  let result = [''];

  for (let i = 0; i < string.length; i++) {
    if (string[i] === '|' && !openLink && !escape) {
      result.push('');
    } else {
      result[result.length - 1] += string[i];
      if (string[i] === '\\' && !escape) { escape = true; } else { escape = false; }
      if (string[i] === '[' && !oneOpenBracket) oneOpenBracket = true;
      if (string[i] === '[' && oneOpenBracket) (openLink = true) && (oneOpenBracket = false);
      if (string[i] === ']' && openLink && !oneCloseBracket) oneCloseBracket = true;
      if (string[i] === ']' && openLink && oneCloseBracket) openLink = false;

    }
  }

  return result.slice(1, -1);
}

function wrapText(str, width) {
  var paragraphs = str.split('\n');
  return paragraphs.map(paragraph => {
    let words = paragraph.split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      // Check if the current word will fit on the current line.
      if (line.length + ' '.length + words[i].length <= width) {
        line += (line ? ' ': '') + words[i];
      } else {
        // The current word will not fit on the current line.
        lines.push(line);
        line = '  ' + words[i];
      }
    }
    // Add the last line to the output.
    lines.push(line);
    return lines.join('\n');
  }).join('\n').trim()
};

function tryAndWriteHtmlError(func, options) {
  try {
    func(options);
  } catch(e) {
    fs.writeFileSync(
      'build/index.html',
      `<h1 style="text-align: center;">Error building project</h1>
      <p style="font-size: 24px; width: 800px; margin: auto; overflow-wrap: break-word;">${stripAnsi(e.message).replace(/\n+/g, '<br><br>')}</p>`
    );

    throw e; // rethrow the error so that the appropriate logging can be added
  }
}

function detectTextDirection(text) {
  // Regular expression patterns for different character ranges
  const rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';
  const ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
                   '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF';
  const rtlDirCheck = new RegExp(`^[^${ltrChars}]*[${rtlChars}]`);

  // Check if the text is RTL
  return rtlDirCheck.test(text) ? 'rtl' : 'ltr';
}


module.exports = { DefaultTopic, canopyLocation, displaySegment, tryDefaultTopic, splitOnPipes, wrapText, tryAndWriteHtmlError, detectTextDirection };
