let { paragraphsOfFile, extractKeyAndParagraph, TopicName } = require('./helpers');

function buildProvisionalNamespaceObject(pathList) {
  let namespacesObject = {};

  pathList.forEach(function(path){
    let paragraphsWithKeys = paragraphsOfFile(path);
    let topicKeyAndParagraph = extractKeyAndParagraph(paragraphsWithKeys[0]);
    if (!topicKeyAndParagraph.key) return;
    let currentTopic = new TopicName(topicKeyAndParagraph.key);

    namespacesObject[currentTopic.caps] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey) {
      let { key, paragraph } = extractKeyAndParagraph(paragraphWithKey);
      if (key) {
        let subtopic = new TopicName(key);
        namespacesObject[currentTopic.caps][subtopic.caps] = subtopic;
      }
    });
  });

  return namespacesObject;
}

module.exports = buildProvisionalNamespaceObject;
