let parseText = require('./parse_text');
let { consolidateTextTokens } = require('./helpers');
let { TextToken } = require('./tokens');

function parseLine(line, tokens, parserContext) {
  if (line.match(/^```\s*/) || (tokens[tokens.length - 1]?.type === 'code_block' && tokens[tokens.length - 1]?.open)) {
    handleCodeBlock(line, tokens);
  } else if (line.match(/^`( |$)/)) {
    handleCodeLine(line, tokens);
  } else if (line.match(/^\s*>/)) {
    handleBlockQuote(line, tokens);
  } else if (line.match(/^\s*([A-Za-z0-9+*-]{1,3}\.|[+*-])\s+\S+/)) {
    handleOutline(line, tokens, parserContext);
  } else if (line.match(/^\|([^|\n]*\|)+/) || (line.match(/^\s*[=#-]+\s*$/) && tokens[tokens.length - 1]?.type === 'table')) {
    handleTable(line, tokens, parserContext);
  } else if (line.match(/^\s*<\/?\w+>(.*<\/\w+>)?/)) {
    handleHtml(line, tokens);
  } else if (line.match(/^\s*\[\^[^\]]+]:/)) {
    handleFootnote(line, tokens, parserContext);
  } else {
    handleText(line, tokens, parserContext);
  }

  return tokens;
}

function handleCodeBlock(line, tokens) {
  let previousToken = tokens[tokens.length - 1];
  if (previousToken?.type === 'code_block' && previousToken.style === 'fence' && previousToken?.['open']) {
    if (line.match(/^```\s*/)) {
      delete tokens[tokens.length - 1].open;
    } else {
      tokens[tokens.length - 1].text += line + '\n';
    }
  } else if (line.match(/^```\s*/)) {
    tokens.push({
      type: 'code_block',
      open: true,
      style: 'fence',
      text: ''
    });
  } else {
    throw new Error('Error identifying code block');
  }
}

function handleCodeLine(line, tokens) {
  let text = line.match(/^` (.*)$/)?.[1] || '';
  let previousToken = tokens[tokens.length - 1];

  if (previousToken?.type === 'code_block' && previousToken?.style === 'prefix') {
    previousToken.text += text + '\n';
  } else {
    tokens.push({
      type: 'code_block',
      style: 'prefix',
      text: text + '\n'
    });
  }
}

function handleBlockQuote(line, tokens) {
  let text = line.match(/^\s*>\s?(.*)/)[1];
  if (tokens[tokens.length - 1]?.type === 'quote') {
    tokens[tokens.length - 1].text += text + '\n';
  } else {
    tokens.push({
      type: 'quote',
      text: text + '\n'
    });
  }
}

function handleOutline(line, tokens, parserContext) {
  let outlineToken;
  if (tokens[tokens.length - 1]?.type === 'list') {
    outlineToken = tokens[tokens.length - 1];
  } else {
    outlineToken = {
      topLevelNodes: [],
      type: 'list',
      lastNode: null,
      text: ''
    };

    tokens.push(outlineToken);
  }

  let { topLevelNodes } = outlineToken;

  let initialWhitespace = line.match(/^(\s*)/)[1];
  let orderedListMatch = line.match(/^\s*(\S+)\.\s?(.*$)/);
  let unorderedListMatch = line.match(/^\s*([+*-])\s?(.*$)/);
  let match = orderedListMatch || unorderedListMatch;

  let ordinal = match[1];
  let lineContents = match[2];
  let tokensOfLine = parseText(lineContents, parserContext);

  let newNode = {
    indentation: initialWhitespace.length,
    ordinal: ordinal,
    ordered: !!orderedListMatch,
    tokensOfLine: tokensOfLine,
    children: [],
    parentNode: null
  };

  if (!outlineToken.lastNode) { // This is the first node we're parsing
    topLevelNodes.push(newNode);
  } else if (newNode.indentation > outlineToken.lastNode.indentation) { // Child node of the previous line
    newNode.parentNode = outlineToken.lastNode;
    outlineToken.lastNode.children.push(newNode);
  } else if (newNode.indentation === outlineToken.lastNode.indentation) { // Sibling node of the previous line
    if (newNode.indentation === 0) {
      topLevelNodes.push(newNode);
    } else {
      newNode.parentNode = outlineToken.lastNode.parentNode;
      outlineToken.lastNode.parentNode.children.push(newNode);
    }
  } else { // Child node of a previous line, or new top-level node
    let parentNode = outlineToken.lastNode;
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

  outlineToken.lastNode = newNode;
  outlineToken.text += line + "\n";
}

function handleTable(line, tokens, parserContext) {
  if (line.match(/^\s*[=#-|]+\s*$/)) {
    return; // ignore horizontal row marker
  }

  let cellStrings = line.
    replace(/\\\|/g, '__ESCAPED_PIPE__').
    split('|').
    map(string => string.replace(/__ESCAPED_PIPE__/g, '|')).
    slice(1, -1);

  let tokensByCell = cellStrings.map(
    (cellString) => parseText(cellString.trim(), parserContext) // we trim because the person might be using spaces to line up unevenly sized cells
  );

  if (tokens[tokens.length - 1]?.type === 'table') {
    tokens[tokens.length - 1]?.rows.push(tokensByCell);
  } else {
    tokens.push({
      type: 'table',
      rows: [tokensByCell]
    });
  }
}

function handleHtml(line, tokens) {
  if (tokens[tokens.length - 1]?.type === 'html_block') {
    tokens[tokens.length - 1].html += line;
  } else {
    tokens.push({
      type: 'html_block',
      html: line
    });
  }
}

function handleFootnote(line, tokens, parserContext) {
  let match = line.match(/^\[\^([^\]]+)]:(.*$)/);
  let superscript = match[1];
  let text = match[2];
  let footnoteTokens = parseText(text, parserContext);

  if (tokens[tokens.length - 1]?.type !== 'footnote_line') {
    tokens.push({
      type: 'footnote_rule'
    });
  }

  tokens.push({
    type: 'footnote_line',
    superscript,
    tokens: footnoteTokens
  });
}

function handleText(line, tokens, parserContext) {
  // We add a space to text tokens at the end of a line because lines are concatenated without newlines
  let paddingSpace = parserContext.lastLine ? [] : [new TextToken(' ')];

  consolidateTextTokens(parseText(line, parserContext).concat(paddingSpace)).forEach(token => {
    tokens.push(token);
  });
}

module.exports = parseLine;
