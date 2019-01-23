import fs from 'fs';
import parseParagraph from 'components/parse_paragraph';
import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';

function jsonForDgsFile(path, namespaceObject) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  let tokenizedParagraphsByKey = {};
  let topicOfFile = extractKeyAndParagraph(paragraphsWithKeys[0]).key;
  if (!topicOfFile) { return ''; }

  paragraphsWithKeys.forEach(function(paragraphWithKey){
    let paragraphData = extractKeyAndParagraph(paragraphWithKey);
    if (!paragraphData.key) { return; }

    let currentSubtopic = paragraphData.key;
    let textWithoutKey = paragraphData.paragraph;

    let tokensOfParagraph = parseParagraph(
      textWithoutKey,
      namespaceObject,
      currentSubtopic,
      topicOfFile
    );

    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
  });

  return JSON.stringify(
    tokenizedParagraphsByKey,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
  );
}

export default jsonForDgsFile;
