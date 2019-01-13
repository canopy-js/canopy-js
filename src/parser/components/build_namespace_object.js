import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';

function buildNamespaceObject(pathList) {
  let namespacesObject = {};

  pathList.forEach(function(path){
    let paragraphsWithKeys = paragraphsOfFile(path);
    let currentTopic = extractKeyAndParagraph(paragraphsWithKeys[0]).key;

    namespacesObject[currentTopic] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey) {
      let key = paragraphWithKey.split(':')[0];
      namespacesObject[currentTopic][key] = true;
    });
  });

  return namespacesObject;
}

export default buildNamespaceObject;
