import linesByBlockOf from 'helpers/lines_by_block_of';
import { textToken } from 'components/tokens';
import {
  textBlockFor,
  codeBlockFor,
  quoteBlockFor,
  listBlockFor,
  tableBlockFor,
  footnoteBlockFor
} from 'components/block_parsers';

function parseParagraph(textWithoutKey, topicSubtopics, currentSubtopic, currentTopic) {
  let parsingContext = {
    topicSubtopics,
    currentSubtopic,
    currentTopic,
    avaliableNamespaces: [],
    markdownOnly: false
  }
  let linesContainerObjects = linesByBlockOf(textWithoutKey);

  let blockObjects = linesContainerObjects.map((linesContainerObject) => {
    if (linesContainerObject.type === 'text') {
      return textBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'code') {
      return codeBlockFor(linesContainerObject.lines);
    } else if (linesContainerObject.type === 'quote') {
      return quoteBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'list') {
      return listBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'table') {
      return tableBlockFor(linesContainerObject.lines, parsingContext);
    } else if (linesContainerObject.type === 'footnote') {
      return footnoteBlockFor(linesContainerObject.lines, parsingContext);
    }
  });

  return blockObjects;
}

export default parseParagraph;
