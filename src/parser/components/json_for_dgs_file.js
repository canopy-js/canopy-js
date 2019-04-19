import fs from 'fs';
import parseParagraph from 'components/parse_paragraph';
import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';
import { removeMarkdownTokens } from 'helpers/identifiers';
import subsumingPathExists from 'helpers/subsuming_path_exists';

function jsonForDgsFile(path, namespaceObject) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  let tokenizedParagraphsByKey = {};
  let displayTopicOfFile = extractKeyAndParagraph(paragraphsWithKeys[0]).key;
  let topicOfFile = removeMarkdownTokens(displayTopicOfFile);

  paragraphsWithKeys.forEach(function(paragraphWithKey) {
    let paragraphData = extractKeyAndParagraph(paragraphWithKey);
    if (!paragraphData.key) { return; }

    let currentSubtopic = removeMarkdownTokens(paragraphData.key);
    let textWithoutKey = paragraphData.paragraph;

    let tokensOfParagraph = parseParagraph(
      textWithoutKey,
      {
        topicSubtopics: namespaceObject,
        currentSubtopic,
        currentTopic: topicOfFile,
        avaliableNamespaces: [],
      }
    );

    tokenizedParagraphsByKey[currentSubtopic] = tokensOfParagraph;
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
