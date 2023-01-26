let fs = require('fs');
let Topic = require('./topic');
let Paragraph = require('./paragraph');
let { getRecursiveSubdirectoryFiles } = require('../bulk/helpers');
let chalk = require('chalk');
let path = require('path');
let shell = require('shelljs')

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
    this.slug = (new Topic(this.name)).slug;
  }
}

let canopyLocation = process.env.CANOPY_LOCATION || path.dirname(path.dirname(fs.realpathSync(shell.which('canopy').stdout)));

function displaySegment(topicName, subtopicName) {
  if (topicName === subtopicName) {
    return `[${topicName}]`;
  } else {
    return `[${subtopicName} (${topicName})]`;
  }
}

module.exports = { DefaultTopic, canopyLocation, displaySegment };
