function TextToken(text, preserveNewlines) {
  if (!preserveNewlines) {
    text = text.replace('\n', ' ');
  }

  this.text = text;
  this.type = 'text';
}

function LocalReferenceToken(
  targetTopic,
  targetSubtopic,
  enclosingTopic,
  enclosingSubtopic,
  text,
  parserContext
) {
  this.text = text;
  this.type = 'local';
  this.tokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: true, recursive: true });
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function GlobalReferenceToken(
  targetTopic,
  targetSubtopic,
  enclosingTopic,
  enclosingSubtopic,
  text,
  parserContext
) {
  this.text = text;
  this.type = 'global';
  this.tokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: true, recursive: true });
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function ImportReferenceToken(
  targetTopic,
  targetSubtopic,
  enclosingTopic,
  enclosingSubtopic,
  text,
  parserContext
) {
  this.text = text;
  this.type = 'import';
  this.tokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: true, recursive: true });
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function UrlToken(url, text, parserContext) {
  this.type = 'url';
  this.url = url || text;
  if (!text) {
    this.tokens = [{ type: 'text', text: url }]; // to avoid infinite loop of URL recognition
  } else {
    this.tokens = parserContext.parseText({ text: text || url, parserContext: parserContext.clone(), preserveNewlines: true, recursive: true });
  }
}

function ImageToken(alt, resourceUrl, title, anchorUrl) {
  this.type = 'image';
  this.resourceUrl = resourceUrl;
  this.title = title || null;
  this.altText = alt || null;
  this.anchorUrl = anchorUrl || null;
}

function FootnoteMarkerToken(superscript) {
  this.type = 'footnote_marker';
  this.text = superscript;
}

function HtmlToken(html) {
  this.type = 'html_element';
  this.html = html;
}

function CodeBlockToken(text) {
  this.type = 'code_block';
  this.text = text.split('\\\\').map(s => s.replace('\\', '')).join('\\'); // remove single backslashes, and replace double with single
}

function BlockQuoteToken(text, direction, parserContext) {
  this.type = 'block_quote';
  parserContext.clone();
  this.tokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: true, recursive: true });
  this.direction = direction;
}

function OutlineToken(text, parserContext) {
  this.topLevelNodes = [];
  this.type = 'outline';

  text.split("\n").forEach((line) => { // we trim so that a trailing newline is removed
    let initialWhitespace = line.match(/^(\s*)/)[1];
    let orderedListMatch = line.match(/^\s*(\S+)\.\s?(.*$)/);
    let unorderedListMatch = line.match(/^\s*([+*-])\s?(.*$)/);
    let match = orderedListMatch || unorderedListMatch;

    let ordinal = match[1];
    let lineContents = match[2];
    let tokensOfLine = parserContext.parseText({ text: lineContents, parserContext: parserContext.clone(), preserveNewlines: false, recursive: true });

    let newNode = {
      indentation: initialWhitespace.length,
      ordinal: ordinal,
      ordered: !!orderedListMatch,
      tokensOfLine: tokensOfLine,
      children: [],
      parentNode: null
    };

    if (!this.lastNode) {
      this.topLevelNodes.push(newNode); // This is the first node we're parsing
    } else if (newNode.indentation > this.lastNode.indentation) { // Child node of the previous line
      newNode.parentNode = this.lastNode;
      this.lastNode.children.push(newNode);
    } else if (newNode.indentation === this.lastNode.indentation) { // Sibling node of the previous line
      if (newNode.indentation === 0) {
        this.topLevelNodes.push(newNode);
      } else {
        newNode.parentNode = this.lastNode.parentNode;
        this.lastNode.parentNode.children.push(newNode);
      }
    } else { // Child node of a previous line, or new top-level node
      let parentNode = this.lastNode;
      while (parentNode && newNode.indentation <= parentNode.indentation) {
        parentNode = parentNode.parentNode;
      }
      if (!parentNode) {
        this.topLevelNodes.push(newNode);
        newNode.parentNode = null;
      } else {
        newNode.parentNode = parentNode;
        parentNode.children.push(newNode);
      }
    }

    this.lastNode = newNode;
  });

  removeCircularListKeys([this])

  function removeCircularListKeys(tokens) {
    tokens.filter(token => token.type === 'outline').forEach(token => {
      delete token.lastNode;
      token.topLevelNodes.forEach(node => removeExtraKeys(node));
    });
  }

  function removeExtraKeys(node) {
    delete node.parentNode;
    delete node.indentation;
    node.children.forEach(removeExtraKeys);
  }
}

function TableToken(text, parserContext) {
  this.type = 'table';
  this.rows = [];

  text.split("\n").forEach(line => {
    if (line.match(/^\s*[=#-|]+\s*$/)) {
      return; // ignore horizontal row marker
    }

    let cellStrings = line.
      replace(/\\\|/g, '__ESCAPED_PIPE__').
      split('|').
      map(string => string.replace(/__ESCAPED_PIPE__/g, '|')).
      slice(1, -1);

    let tokensByCell = cellStrings.map(
      (cellString) => parserContext.parseText({ text: cellString.trim(), parserContext: parserContext.clone(), preserveNewlines: null, recursive: true }) // we trim because the person might be using spaces to line up unevenly sized cells
    );

    this.rows.push(tokensByCell);
  });
}

function FootnoteLinesToken(text, parserContext, _, previousCharacter) {
  this.type = 'footnote_lines';
  this.lines = [];

  let matches = Array.from(text.matchAll(/^\[\^([^\]]+)]:([^\n]*($|\n))/msg));

  matches.forEach(match => {
    let superscript = match[1];
    let text = match[2];
    let footnoteTokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: null, recursive: true });

    this.lines.push({
      superscript,
      tokens: footnoteTokens
    });
  });
}

function ItalicsToken(text, parserContext, _, previousCharacter) {
  this.type = 'italics';
  this.tokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: parserContext.preserveNewlines, recursive: true });
}

function BoldToken(text, parserContext, _, previousCharacter) {
  this.type = 'bold';
  this.tokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: parserContext.preserveNewlines, recursive: true });
}

function InlineCodeSnippetToken(text, parserContext) {
  this.type = 'inline_code';
  this.text = text.split('\\\\').map(s => s.replace('\\', '')).join('\\'); // remove single backslashes, and replace double with single;
}

function StrikethroughToken(text, parserContext, _, previousCharacter) {
  this.type = 'strikethrough';
  this.tokens = parserContext.parseText({ text, parserContext: parserContext.clone(), preserveNewlines: parserContext.preserveNewlines, recursive: true });
}

module.exports = {
  LocalReferenceToken,
  GlobalReferenceToken,
  ImportReferenceToken,
  TextToken,
  UrlToken,
  ImageToken,
  FootnoteMarkerToken,
  HtmlToken,
  CodeBlockToken,
  BlockQuoteToken,
  OutlineToken,
  TableToken,
  FootnoteLinesToken,
  ItalicsToken,
  BoldToken,
  InlineCodeSnippetToken,
  StrikethroughToken
};
