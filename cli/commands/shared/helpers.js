let fs = require('fs');
let Topic = require('./topic');
let Paragraph = require('./paragraph');
let { getRecursiveSubdirectoryFiles } = require('../bulk/helpers');

function getDefaultTopicAndPath() {
  let defaultTopicName = fs.readFileSync('.canopy_default_topic').toString().trim();
  let defaultTopicFilePath = getRecursiveSubdirectoryFiles('topics').find(path => {
    let paragraph = new Paragraph(fs.readFileSync(path).toString());
    return paragraph.key === defaultTopicName;
  });
  let categoryPath = defaultTopicFilePath?.match(/topics\/(.*)\/[^\/]+.expl/)[1];
  let defaultTopicDisplayCategoryPath = categoryPath && Topic.convertUnderscoresToSpaces(categoryPath);
  return {
    defaultTopicDisplayCategoryPath, defaultTopicFilePath, defaultTopicName
  }
}

module.exports = { getDefaultTopicAndPath };
