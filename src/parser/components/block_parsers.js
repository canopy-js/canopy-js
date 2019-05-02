import parseSentence from './parse_sentence';
import sentencesWithPunctuationOf from '../helpers/clauses_with_punctuation_of';
import { TextToken } from './tokens';

function textBlockFor(lines, parsingContext) {
  let tokensByLine = lines.map(
    (line) => parseTokens(line, parsingContext)
  )

  return {
    type: 'text',
    tokensByLine
  }
}

function codeBlockFor(lines) {
  let linesWithoutInitialPoundSigns = lines.map(
    (line) => line.match(/^\s*#\s?(.*)/)[1]
  );

  return {
    type: 'code',
    lines: linesWithoutInitialPoundSigns
  }
}

function quoteBlockFor(lines, parsingContext) {
  let modifiedParsingContext = { markdownOnly: true, ...parsingContext }
  let tokensByLine = lines.map((line) => line.match(/^\s*>\s?(.*)$/)[1]).map(
    (line) => parseTokens(line, modifiedParsingContext)
  );

  return {
    type: 'quote',
    tokensByLine
  }
}

function listBlockFor(lines, parsingContext) {
  let topLevelNodes = [];
  let lastNode;

  lines.forEach((line) => {
    let initialWhitespace = line.match(/^(\s*)/)[1];
    let orderedListMatch = line.match(/^\s*(\S+)\.\s?(.*$)/);
    let unorderedListMatch = line.match(/^\s*([+*-])\s?(.*$)/);
    let match = orderedListMatch || unorderedListMatch;

    let ordinal = match[1];
    let lineContents = match[2];
    let tokensOfLine = parseTokens(lineContents, parsingContext);

    let newNode = {
      indentation: initialWhitespace.length,
      ordinal: ordinal,
      ordered: !!orderedListMatch,
      tokensOfLine: tokensOfLine,
      children: [],
      parentNode: null
    }

    if (!lastNode) {
      topLevelNodes.push(newNode);
    } else if (newNode.indentation > lastNode.indentation) {
      newNode.parentNode = lastNode;
      lastNode.children.push(newNode);
    } else if (newNode.indentation === lastNode.indentation) {
      if (topLevelNodes.includes(lastNode)) {
        topLevelNodes.push(newNode);
      } else {
        newNode.parentNode = lastNode.parentNode;
        lastNode.parentNode.children.push(newNode);
      }
    } else {
      let parentNode = lastNode;
      while (parentNode && newNode.indentation <= parentNode.indentation) {
        parentNode = parentNode.parentNode;
      }
      if (!parentNode) {
        topLevelNodes.push(newNode);
        newNode.parentNode = null;
      } else {
        newNode.parentNode = parentNode;
        parentNode.children.push(newNode);
      }
    }

    lastNode = newNode;
  });

  topLevelNodes.forEach(removeExtraKeys);

  return {
    type: 'list',
    topLevelNodes
  }
}

function removeExtraKeys(node) {
  delete node.parentNode;
  delete node.indentation;
  node.children.forEach(removeExtraKeys);
}

function tableBlockFor(lines, parsingContext) {
  let rows = lines.map((line) => line.
      replace(/(?:^|([^\\]))\|/g, '$1||').
      split('||').
      slice(1, -1)
    );

  if (rows[1][0].match(/^\s*[=#-]+\s*$/)) {
    rows.splice(1, 1);
  }

  let tokensByCellByRow = rows.map((cellsOfRow) =>
    cellsOfRow.map(
      (cell) => Array.prototype.concat.apply(
        [], parseTokens(cell, parsingContext)
      )
    )
  );

  return {
    type: 'table',
    tokensByCellByRow
  }
}

function footnoteBlockFor(lines, parsingContext) {
  let footnoteObjects = lines.map((footnote) => {
    let match = footnote.match(/^\[\^([^\]]+)]\:(.*$)/);
    let superscript = match[1];
    let text = match[2];

    let tokens = parseTokens(text, parsingContext);

    return {
      superscript,
      tokens
    }
  });

  return {
    type: 'footnote',
    footnoteObjects
  }
}

function parseTokens(line, parsingContext) {
  return Array.prototype.concat.apply([], sentencesWithPunctuationOf(line).map(
    (clauseString) => parseSentence(
      clauseString,
      parsingContext
    )
  ));
}

export {
  textBlockFor,
  codeBlockFor,
  quoteBlockFor,
  listBlockFor,
  tableBlockFor,
  footnoteBlockFor
}
