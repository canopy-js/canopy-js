import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';
import { removeMarkdownTokens } from 'helpers/identifiers';

function buildProvisionalNamespaceObject(pathList) {
  let namespacesObject = {};

  pathList.forEach(function(path){
    let paragraphsWithKeys = paragraphsOfFile(path);
    let topicKeyAndParagraph = extractKeyAndParagraph(paragraphsWithKeys[0]);
    if (!topicKeyAndParagraph.key) return;

    let currentTopic = removeMarkdownTokens(topicKeyAndParagraph.key);
    namespacesObject[currentTopic] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey) {
      let keyAndParagraph = extractKeyAndParagraph(paragraphWithKey);
      if (keyAndParagraph.key) {
        let key = removeMarkdownTokens(keyAndParagraph.key);
        namespacesObject[currentTopic][key] = true;
      }
    });
  });

  return namespacesObject;
}

export default buildProvisionalNamespaceObject;
