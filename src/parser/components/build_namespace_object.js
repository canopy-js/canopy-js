import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';
import withoutArticle from 'helpers/without_article';
import capitalize from 'helpers/capitalize';

function buildNamespaceObject(pathList) {
  var namespacesObject = {};

  pathList.forEach(function(path){
    var paragraphsWithKeys = paragraphsOfFile(path);
    var currentTopicKey = capitalize(withoutArticle(
      extractKeyAndParagraph(paragraphsWithKeys[0]).key
    ));

    namespacesObject[currentTopicKey] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey){
      var key = paragraphWithKey.split(':')[0];
      var keyWithoutArticle = capitalize(withoutArticle(key));
      namespacesObject[currentTopicKey][keyWithoutArticle] = key;
    });
  });

  return namespacesObject;
}

export default buildNamespaceObject;
