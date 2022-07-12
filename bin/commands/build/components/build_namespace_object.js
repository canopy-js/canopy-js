let { paragraphsOfFile } = require('./helpers');
let { TopicName } = require('../../shared');
let { Paragraph } = require('../../shared');

function buildNamespaceObject(pathList) {
  let namespacesObject = {};

  pathList.forEach(function(path){
    let paragraphsWithKeys = paragraphsOfFile(path);
    let topicParargaph = new Paragraph(paragraphsWithKeys[0]);
    if (!topicParargaph.key) return;
    let currentTopic = new TopicName(topicParargaph.key);
    namespacesObject[currentTopic.caps] = {};

    paragraphsWithKeys.forEach(function(paragraphText) {
      let paragraph = new Paragraph(paragraphText);
      if (paragraph.key) {
        let subtopic = new TopicName(paragraph.key);
        namespacesObject[currentTopic.caps][subtopic.caps] = subtopic;
      }
    });
  });

  return namespacesObject;
}

module.exports = buildNamespaceObject;
