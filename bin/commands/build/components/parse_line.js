let { TextToken } = require('./tokens');
let parseText = require('./parse_text');

function parseLine(line, tokens, parserContext) {
  if (line.match(/^```\s*/) || (tokens[tokens.length - 1]?.type === 'code_block' && tokens[tokens.length - 1]?.open)) {
    handleCodeBlock(line, tokens);
  } else if (line.match(/^\s*>/)) {
    handleBlockQuote(line, tokens);
  } else if (line.match(/^\s*([A-Za-z0-9+*-]{1,3}\.|[+*-])\s+\S+/)) {
    handleOutline(line, tokens, parserContext);
  } else if (line.match(/^\|([^|\n]*\|)+/) || (line.match(/^\s*[=#-]+\s*$/) && tokens[tokens.length - 1]?.type === 'table')) {
    handleTable(line, tokens, parserContext)
  } else if (line.match(/^<\w+>.*<\/\w+>/)) {
    handleHtml(line);
  } else if (line.match(/^\s*\[\^[^\]]+]\:/)) {
    handleFootnote(line, tokens, parserContext);
  } else {
    handleText(line, tokens, parserContext);
  }

  return tokens;
}

function handleCodeBlock(line, tokens) {
  if (tokens[tokens.length - 1]?.type === 'code_block' && tokens[tokens.length - 1]?.hasOwnProperty('open')) {
    if (line.match(/^```\s*/)) {
      delete tokens[tokens.length - 1].open;
    } else {
      tokens[tokens.length - 1].text += line + '\n';
    }
  } else if (line.match(/^```\s*/)) {
    tokens.push({
      type: 'code_block',
      open: true,
      text: ''
    });
  } else {
    throw 'Error identifying code block';
  }
}

function handleBlockQuote(line, tokens) {
  let text = line.match(/^\s*>\s(.*)/)[1];
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
  }

  if (!outlineToken.lastNode) {
    topLevelNodes.push(newNode);
  } else if (newNode.indentation > outlineToken.lastNode.indentation) {
    newNode.parentNode = outlineToken.lastNode;
    outlineToken.lastNode.children.push(newNode);
  } else if (newNode.indentation === outlineToken.lastNode.indentation) {
    if (newNode.indentation === 0) {
      topLevelNodes.push(newNode);
    } else {
      newNode.parentNode = outlineToken.lastNode.parentNode;
      outlineToken.lastNode.parentNode.children.push(newNode);
    }
  } else {
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
    (cellString) => parseText(cellString, parserContext)
  );

  if (tokens[tokens.length - 1]?.type === 'table') {
    tokens[tokens.length - 1]?.rows.push(tokensByCell)
  } else {
    tokens.push({
      type: 'table',
      rows: [tokensByCell]
    });
  }
}

function handleHtml(line, tokens) {
  if (tokens[tokens.length - 1]?.type === 'html') {
    tokens[tokens.length - 1].text += line + "\n";
  } else {
    tokens.push({
      type: 'html',
      text: line + "\n"
    });
  }
}

function handleFootnote(line, tokens, parserContext) {
  let match = line.match(/^\[\^([^\]]+)]\:(.*$)/);
  let superscript = match[1];
  let text = match[2];
  let footnoteTokens = parseText(text, parserContext);

  if (tokens[tokens.length - 1]?.type !== 'footnote_line') {
    tokens.push({
      type: 'footnote_rule'
    })
  }

  tokens.push({
    type: 'footnote_line',
    superscript,
    tokens: footnoteTokens
  });
}

function handleText(line, tokens, parserContext) {
  parseText(line, parserContext).forEach(token => {
    tokens.push(token);
  });
}

module.exports = parseLine;
