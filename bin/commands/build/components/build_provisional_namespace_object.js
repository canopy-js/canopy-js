let { paragraphsOfFile, extractKeyAndParagraph, removeMarkdownTokens} = require('./helpers');

function buildProvisionalNamespaceObject(pathList) {
  let namespacesObject = {};

  pathList.forEach(function(path){
    let paragraphsWithKeys = paragraphsOfFile(path);
    let topicKeyAndParagraph = extractKeyAndParagraph(paragraphsWithKeys[0]);
    if (!topicKeyAndParagraph.key) return;

    let currentTopic = removeMarkdownTokens(topicKeyAndParagraph.key).toUpperCase();
    namespacesObject[currentTopic] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey) {
      let keyAndParagraph = extractKeyAndParagraph(paragraphWithKey);
      if (keyAndParagraph.key) {
        // There are several permutations of the topic key:
        // There is the "displayTopic", this is the string precisely as it appears in the expl file
        // There is a "mixed case" topic, which is the displayTopic sans markdown characters eg * _ ~ etc
        // There is an all caps topic, this is the mixed case topic but all caps, used for case-insensitive matching
        // Filenames at some point will probably be url encoded versions of the mixed case topic.
        let key = removeMarkdownTokens(keyAndParagraph.key);
        namespacesObject[currentTopic][key.toUpperCase()] = { mixedCase: key };
      }
    });
  });

  return namespacesObject;
}

module.exports = buildProvisionalNamespaceObject;
