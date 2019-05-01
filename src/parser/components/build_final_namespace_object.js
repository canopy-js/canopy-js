import fs from 'fs';
import parseParagraph from 'components/parse_paragraph';
import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';
import { removeMarkdownTokens } from 'helpers/identifiers';
import subsumingPathExists from 'helpers/subsuming_path_exists';

function buildFinalNamespaceObject(dgsFilePaths, provisionalNamespaceObject) {
  let finalNamespaceObject = {};
  let localReferenceGraph = {};

  dgsFilePaths.forEach((path) => {
    let paragraphsWithKeys = paragraphsOfFile(path);
    let displayTopicOfFile = extractKeyAndParagraph(paragraphsWithKeys[0]).key;
    let topicOfFile = removeMarkdownTokens(displayTopicOfFile);
    finalNamespaceObject[topicOfFile] = {};

    paragraphsWithKeys.forEach(function(paragraphWithKey) {
      let paragraphData = extractKeyAndParagraph(paragraphWithKey);

      if (!paragraphData.key) { return; }

      let currentSubtopic = removeMarkdownTokens(paragraphData.key);
      let textWithoutKey = paragraphData.paragraph;

      parseParagraph(
        textWithoutKey,
        {
          topicSubtopics: provisionalNamespaceObject,
          currentSubtopic,
          currentTopic: topicOfFile,
          avaliableNamespaces: [],
          markdownOnly: false,
          localReferenceGraph
        }
      );

      if (subsumingPathExists(topicOfFile, currentSubtopic, localReferenceGraph)) {
        finalNamespaceObject[topicOfFile][currentSubtopic] = true;
      }
    });
  });

  return finalNamespaceObject;
}

export default buildFinalNamespaceObject;
