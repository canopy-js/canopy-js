import parseClause from './parse_clause';
import clausesWithPunctuationOf from '../helpers/clauses_with_punctuation_of';
import { TextToken } from './tokens';

function textBlockFor(lines, parsingContext) {
  let tokensByLine = lines.map(
    (line) => linkifyMatches(line, parsingContext)
  )

  return {
    type: 'text',
    tokensByLine
  }
}

function codeBlockFor(lines) {
  let linesWithoutInitialBackticks = lines.map(
    (line) => line.match(/^\s*`(.*)/)[1]
  );

  return {
    type: 'code',
    lines: linesWithoutInitialBackticks
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
    let orderedListMatch = line.match(/^\s*(\S+)\.(.*$)/);
    let unorderedListMatch = line.match(/^\s*([+*-])(.*$)/);
    let match = orderedListMatch || unorderedListMatch;

    let ordinal = match[1];
    let lineContents = match[2];
    let tokensOfLine = linkifyMatches(lineContents, parsingContext);

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

  topLevelNodes.forEach(removeParentNodes);

  return {
    type: 'list',
    topLevelNodes
  }
}

function removeParentNodes(node) {
  delete node.parentNode;
  node.children.forEach(removeParentNodes);
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
        [], linkifyMatches(cell, parsingContext)
      )
    )
  );

  return {
    type: 'table',
    tokensByCellByRow
  }
}

function footnoteBlockFor(lines) {
  let footnoteObjects = lines.map((footnote) => {
    let match = footnote.match(/^\[\^([^\]]+)]\:(.*$)/);
    let superscript = match[1];
    let text = match[2];

    return {
      text,
      superscript
    }
  });

  return {
    type: 'footnote',
    footnoteObjects
  }
}

function linkifyMatches(line, parsingContext) {
  return Array.prototype.concat.apply([], clausesWithPunctuationOf(line).map(
    (clauseString) => parseClause(
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
