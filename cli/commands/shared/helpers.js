let fs = require('fs');
let Topic = require('./topic');
let Paragraph = require('./paragraph');
let { getRecursiveSubdirectoryFiles } = require('../bulk/helpers');
let chalk = require('chalk');

function getDefaultTopicAndPath() {
  if (!fs.existsSync('canopy_default_topic')) throw new Error('There must be a default topic file present, try running "canopy init"');
  let defaultTopicFilePath = fs.readFileSync('canopy_default_topic').toString().trim();
  if (!defaultTopicFilePath || !fs.existsSync(defaultTopicFilePath)) {
    throw new Error(chalk.red(`Error: No topic file corresponds to name given in canopy_default_topic: "${defaultTopicName.trim()}"`));
  }
  if (!fs.existsSync(defaultTopicFilePath)) throw new Error(chalk.bgRed(`Default topic file does not exist: ${defaultTopicFilePath}`));
  let defaultTopicName = (new Paragraph(fs.readFileSync(defaultTopicFilePath).toString().trim())).key
  if (!defaultTopicName) {
    throw new Error(chalk.red(`Error: The file referenced in canopy_default_topic lacks a valid topic key: ${defaultTopicFilePath}`));
  }
  let categoryPath = defaultTopicFilePath?.match(/topics\/(.*)\/[^\/]+.expl/)[1];
  let defaultTopicDisplayCategoryPath = categoryPath && Topic.convertUnderscoresToSpaces(categoryPath);
  return {
    defaultTopicDisplayCategoryPath, defaultTopicFilePath, defaultTopicName
  }
}

module.exports = { getDefaultTopicAndPath };
