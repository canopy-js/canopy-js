import fs from 'fs';
import parseParagraph from 'components/parse_paragraph';
import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';
import { removeMarkdownTokens } from 'helpers/identifiers';
import subsumingPathExists from 'helpers/subsuming_path_exists';

function jsonForDgsFile(path, namespaceObject) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  let tokenizedParagraphsByKey = {};
  let localReferenceGraph = {};
  let displayTopicOfFile = extractKeyAndParagraph(paragraphsWithKeys[0]).key;
  let topicOfFile = removeMarkdownTokens(displayTopicOfFile);
  if (!topicOfFile) { return ''; }

  paragraphsWithKeys.forEach(function(paragraphWithKey){
    let paragraphData = extractKeyAndParagraph(paragraphWithKey);
    if (!paragraphData.key) { return; }

    let currentSubtopic = removeMarkdownTokens(paragraphData.key);
    let textWithoutKey = paragraphData.paragraph;

    let tokensOfParagraph = parseParagraph(
      textWithoutKey,
      namespaceObject,
      currentSubtopic,
      topicOfFile,
      localReferenceGraph,
    );

    if (subsumingPathExists(topicOfFile, currentSubtopic, localReferenceGraph)) {
      tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
    } else {
      throw `No local path exists from topic "${topicOfFile}" to "${currentSubtopic}"`;
    }
  });

  let jsonObject = {
    topicDisplayName: displayTopicOfFile,
    paragraphsBySubtopic: tokenizedParagraphsByKey
  }

  return JSON.stringify(
    jsonObject,
    null,
    process.env.CANOPY_DEBUG ? 1 : 0
  );
}

export default jsonForDgsFile;
