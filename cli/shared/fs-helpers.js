let fs = require('fs');
let Topic = require('./topic');
let Block = require('./block');
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
    this.name = (new Block(fs.readFileSync(this.filePath).toString().trim())).key
    if (!this.name) {
      throw new Error(chalk.red(`Error: The file referenced in canopy_default_topic lacks a valid topic key: ${this.filePath}`));
    }
    let categoryPath = this.filePath?.match(/topics\/(.*)\/[^\/]+.expl/)[1];
    this.categoryPath = categoryPath && Topic.convertUnderscoresToSpaces(categoryPath);
    this.fileName = Topic.for(this.name).fileName;
  }
}

let canopyLocation = process.env.CANOPY_LOCATION || path.dirname(path.dirname(fs.realpathSync(shell.which('canopy').stdout)));

function tryDefaultTopic() {
  let defaultTopic = {};
  try { defaultTopic = new DefaultTopic(); } catch {}
  return defaultTopic;
}

function defaultTopic() {
  return new DefaultTopic();
}

function tryAndWriteHtmlError(func, options = {}) {
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


module.exports = { DefaultTopic, canopyLocation, tryDefaultTopic, tryAndWriteHtmlError, defaultTopic };
