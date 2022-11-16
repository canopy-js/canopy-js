let fs = require('fs');
let Topic = require('./topic');
let Paragraph = require('./paragraph');
let { getRecursiveSubdirectoryFiles } = require('../bulk/helpers');
let chalk = require('chalk');

function getDefaultTopicAndPath() {
  let defaultTopicFilePath = fs.readFileSync('canopy_default_topic').toString().trim();
  if (!fs.existsSync(defaultTopicFilePath)) throw new Error(chalk.bgRed(`Default topic file does not exist: ${defaultTopicFilePath}`));
  let defaultTopicName = (new Paragraph(fs.readFileSync(defaultTopicFilePath).toString().trim())).key
  let categoryPath = defaultTopicFilePath?.match(/topics\/(.*)\/[^\/]+.expl/)[1];
  let defaultTopicDisplayCategoryPath = categoryPath && Topic.convertUnderscoresToSpaces(categoryPath);
  return {
    defaultTopicDisplayCategoryPath, defaultTopicFilePath, defaultTopicName
  }
}

module.exports = { getDefaultTopicAndPath };
