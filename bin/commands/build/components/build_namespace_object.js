let { paragraphsOfFile } = require('./helpers');
let Topic = require('../../shared/topic');
let Paragraph = require('../../shared/paragraph');
let dedent = require('dedent-js');

function buildNamespaceObject(explFileData, doubleDefinedSubtopics) {
  let namespacesObject = {};
  let pathsForTopics = {};

  Object.keys(explFileData).forEach(function(path){
    let fileContents = explFileData[path];
    let paragraphsWithKeys = fileContents.trim().split(/\n\n+/);
    let topicParargaph = new Paragraph(paragraphsWithKeys[0]);
    if (!topicParargaph.key) return;
    let currentTopic = new Topic(topicParargaph.key);

    if (namespacesObject.hasOwnProperty(currentTopic.capsFile)) {
      throw dedent`Error: Topic or similar appears twice in project: [${currentTopic.mixedCase}]
      - One file is: ${pathsForTopics[currentTopic.capsFile]}
      - Another file is: ${path}
      `;
    } else {
      pathsForTopics[currentTopic.capsFile] = path;
    }

    namespacesObject[currentTopic.caps] = {};

    paragraphsWithKeys.forEach(function(paragraphText) {
      let paragraph = new Paragraph(paragraphText);
      if (paragraph.key) {
        let currentSubtopic = new Topic(paragraph.key);

        if (namespacesObject[currentTopic.caps].hasOwnProperty(currentSubtopic.caps)) {
          doubleDefinedSubtopics.push([currentTopic, currentSubtopic]);
        }

        namespacesObject[currentTopic.caps][currentSubtopic.caps] = currentSubtopic;
      }
    });
  });

  return namespacesObject;
}

module.exports = buildNamespaceObject;
