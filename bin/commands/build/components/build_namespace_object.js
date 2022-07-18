let { paragraphsOfFile } = require('./helpers');
let { TopicName } = require('../../shared');
let { Paragraph } = require('../../shared');

function buildNamespaceObject(pathList) {
  let namespacesObject = {};
  let uniquenessCheck = {};
  let pathsForTopics = {};

  pathList.forEach(function(path){
    let paragraphsWithKeys = paragraphsOfFile(path);
    let topicParargaph = new Paragraph(paragraphsWithKeys[0]);
    if (!topicParargaph.key) return;
    let currentTopic = new TopicName(topicParargaph.key);
    namespacesObject[currentTopic.caps] = {};

    if (uniquenessCheck.hasOwnProperty(currentTopic.capsFile)) {
      console.error(`Error: Topic or similar appears twice in project: "${currentTopic.mixedCase}\n"` +
      `- One file is: ${path}\n` +
      `- Another file is: ${pathsForTopics[currentTopic.capsFile]}`)
    } else {
      // Topics must be unique to the level of filename, which is the strongest level
      uniquenessCheck[currentTopic.capsFile] = {};
      pathsForTopics[currentTopic.capsFile] = path;
    }

    paragraphsWithKeys.forEach(function(paragraphText) {
      let paragraph = new Paragraph(paragraphText);
      if (paragraph.key) {
        let currentSubtopic = new TopicName(paragraph.key);
        namespacesObject[currentTopic.caps][currentSubtopic.caps] = currentSubtopic;

        if (uniquenessCheck[currentTopic.capsFile].hasOwnProperty(currentSubtopic.mixedCase)) {
          throw `Error: Subtopic "${currentSubtopic.mixedCase}" or similar appears twice in topic: "${currentTopic.mixedCase}"`;
        } else {
          // Subtopics need only have a unique mixed case name, which gives them a unique URL
          uniquenessCheck[currentTopic.capsFile][currentSubtopic.mixedCase] = currentSubtopic;
        }
      }
    });
  });

  return namespacesObject;
}

module.exports = buildNamespaceObject;
