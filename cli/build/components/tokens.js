let { splitOnPipes, detectTextDirection } = require('../../shared/simple-helpers');
let chalk = require('chalk');

function parseText(options) {
  return require('./parse_text')(options); // avoid circular dependency
}

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
  this.tokens = parseText({ text, parserContext: parserContext.clone({ preserveNewlines: true, insideToken: true }) });
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  parserContext.paragraphReferences.push(this); // not necessary for import validation but included for consistency
}

function GlobalReferenceToken(
  pathString,
  enclosingTopic,
  enclosingSubtopic,
  text,
  parserContext
) {
  this.text = text;
  this.type = 'global';
  this.tokens = parseText({ text, parserContext: parserContext.clone({ preserveNewlines: true, insideToken: true }) });
  this.pathString = pathString;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  parserContext.paragraphReferences.push(this);
}

function ExternalLinkToken(url, text, parserContext) {
  this.type = 'external';
  this.url = (url || text).replace(/\\\\|\\./g, match => match === '\\\\' ? '\\' : match[1]);
  this.text = text || url;
  if (!text) {
    this.tokens = [{ type: 'text', text: url }]; // to avoid infinite loop of URL recognition
  } else {
    this.tokens = parseText({ text: text || url, parserContext: parserContext.clone({ preserveNewlines: true, insideToken: true }) });
  }
}

function ImageToken({ alt, resourceUrl, title, caption, anchorUrl, parserContext }) {
  this.type = 'image';
  let { projectPathPrefix } = parserContext;
  if (resourceUrl.startsWith('/') && projectPathPrefix) {
    resourceUrl = `/${projectPathPrefix}${resourceUrl}`;
  }
  this.resourceUrl = resourceUrl;
  this.title = (title||'').split('\\\\').map(s => s.replace(/\\/g, '')).join('') || null; // title is not tokenized so escaping must be done manually
  this.tokens = parseText({
    text: caption || '',
    parserContext: parserContext.clone({ preserveNewlines: false, insideToken: true }) });
  this.altText = alt || null;
  this.caption = caption;
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

  this.tokens = parseText({
    text,
    parserContext: parserContext.clone({
      preserveNewlines: true,
      insideToken: true,
      linePrefixSize: 2 // ie "> "
    }).incrementCharacterNumber('> '.length)
  });

  this.direction = direction;
}

function OutlineToken(text, parserContext) {
  this.topLevelNodes = [];
  this.type = 'outline';

  text.split("\n").filter(Boolean).forEach((line, lineIndex) => { // filter handles terminal newline
    let initialWhitespace = line.match(/^(\s*)/)[1];
    let orderedListMatch = line.match(/^\s*(\S+)(\.\s?)(.*$)/);
    let unorderedListMatch = line.match(/^\s*([+*-])(\s?)(.*$)/);
    let match = orderedListMatch || unorderedListMatch;

    let ordinal = match[1];
    let postOrdinalCharacters = match[2];
    let lineContents = match[3];
    let tokensOfLine = parseText({
      text: lineContents,
      parserContext: parserContext.clone({
        preserveNewlines: false,
        insideToken: true
      }).incrementLineAndResetCharacterNumber(lineIndex).incrementCharacterNumber(initialWhitespace.length + ordinal.length + postOrdinalCharacters.length)
    });

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
  const MERGE_DIRECTION = { 'v': {x: 0, y: 1}, '>': {x: 1, y: 0}, '<': {x: -1, y: 0}, '^': {x: 0, y: -1} };
  let cellObjectList = [];

  text.split("\n")
    .filter(Boolean) // the trailing newline will create an empty row
    .forEach((line, lineNumber) => {
      if (line.match(/^\s*[=#\-|]+\s*$/)) return; // ignore horizontal row marker

      let cellObjects = splitOnPipes(line).map(
        (cellString, cellIndex, cellsOfRow) => {
          if (cellString.match(/^\s*\\[v^<>]\s*$/)) return { tokens: [], merge: MERGE_DIRECTION[cellString.match(/[v^<>]/)[0]] };

          if (cellString.match(/^\s*\\x\s*$/)) return { tokens: [], hidden: true };

          let earlierCharactersOnLine = ['|'] // first | on line
            .concat(
              cellsOfRow.slice(0, cellIndex).join('|'), // all the intermediary cell contents plus pipes
              cellIndex > 0 ? '|' : '' // the pipe before the current cell
            ).join('');

          return {
            tokens: parseText({
              text: cellString.trim(),  // we trim because the person might be using spaces to line up unevenly sized cells
              parserContext: parserContext.clone({
                preserveNewlines: null,
                insideToken: true,
              })
              .incrementLineAndResetCharacterNumber(lineNumber) // we want error messages to know how far into the table we are
              .incrementCharacterNumber(earlierCharactersOnLine.length + cellString.match(/^\s+/)?.[0].length) // count earlier chars and leading space
            })
          }
        }
      );
      this.rows.push(cellObjects);
    });

  if (detectTextDirection(text) === 'rtl') this.dir = 'rtl';

  this.rows.forEach((cellObjects, y, rows) => {
    cellObjects.forEach((cellObject, x, columns) => {
      if (cellObject.merge) {
        let collection = cellObject.merge.x ? columns : rows;
        let op = cellObject.merge;
        let dir = op.x ? 'x' : 'y';
        let attribute = cellObject.merge.x ? 'colspan' : 'rowspan';
        let position = cellObject.merge.x ? y : x;
        let limit = Math.max([op.x, op.y]) > 0 ? collection.length : -1;
        let selection = {x: x + op.x, y: y + op.y};
        if ((selection.x < 0 || selection.x > limit && limit > 0 && dir ==='x')
          ||(selection.y < 0 || selection.y > limit && limit > 0 && dir ==='y')) {
            throw new Error(chalk.red(`Invalid merge instructions in table: ${text}`));
          }

        while(selection[dir] !== limit) {
          if (!rows[selection.y][selection.x].merge) {
            rows[selection.y][selection.x][attribute] = (Number(rows[selection.y][selection.x][attribute]) || 1) + 1;
            break;
          } else {
            if (rows[selection.y][selection.x].merge.x !== op.x || rows[selection.y][selection.x].merge.y !== op.y) {
              throw new Error(chalk.red(`Invalid merge instructions in table: ${text}`)); // eg | \> | \^ |
            }
            selection[dir] += op[dir];
          }
        }
        cellObjectList.push(cellObject); // we preserve the direction information for the above check until we are done will all the cells
      }
    });
  })

  cellObjectList.forEach(cellObject => cellObject.merge && (cellObject.merge = true));
}

function TableListToken(text, parserContext) {
  this.type = 'table_list';

  let items = [...text.matchAll(/(?:- ?|(([\w\d]{1,4})\.\s)|([<>]) )([^\n]+)\n/g)];

  const allRightAligned = items.every(item => item[3] === '>');
  const allLeftAligned = items.every(item => item[3] === '<');
  this.alignment = allRightAligned ? 'right' : (allLeftAligned ? 'left' : null);

  items = items.map(item => {
    if (item[2]) { // It has an ordinal, so it's some sort of list.
     return { list: true, ordinal: item[2], text: item[4] };
    } else if (item[3]) { // It starts with '>' or '<', so it's a left or right aligned list item.
     return { list: false, text: item[4], alignment: item[3] === '>' ? 'right' : 'left' };
    } else { // It's not an ordinal item.
     return { list: false, text: item[4] };
    }
  });

  this.rtl = (text.startsWith('<') || detectTextDirection(text) === 'rtl') ? true : false;

  this.items = items.map((item, lineNumber) => {
    return {
      list: item.list,
      hidden: item.text.includes('\\x'),
      ordinal: item.ordinal,
      tokens: parseText({
        text: item.text.trim(),  // we trim because the person might be using spaces to line up unevenly sized cells
        parserContext: parserContext.clone({
          preserveNewlines: null,
          insideToken: true,
        })
        .incrementLineAndResetCharacterNumber(lineNumber + 1) // how far into the table list are we, line number plus initial delimiter
        .incrementCharacterNumber('- '.length) // count earlier chars and leading space
      })
    }
  });
}

function FootnoteLinesToken(text, parserContext, _, previousCharacter) {
  this.type = 'footnote_lines';
  this.lines = [];

  let matches = Array.from(text.matchAll(/^\[\^([^\]]+)]:([^\n]*($|\n))/msg));

  matches.forEach(match => {
    let superscript = match[1];
    let text = match[2];
    let footnoteTokens = parseText({
      text,
      parserContext: parserContext.clone({
        preserveNewlines: null,
        insideToken: true }).incrementCharacterNumber('['+ superscript + ']:'.length)
    });

    this.lines.push({
      superscript,
      tokens: footnoteTokens
    });
  });
}

function ItalicsToken(text, parserContext, _, previousCharacter) {
  this.type = 'italics';
  this.tokens = parseText({
    text,
    parserContext: parserContext.clone({ insideToken: true }).incrementCharacterNumber('_'.length)
  });
}

function BoldToken(text, parserContext, _, previousCharacter) {
  this.type = 'bold';
  this.tokens = parseText({
    text,
    parserContext: parserContext.clone({ insideToken: true }).incrementCharacterNumber('*'.length)
  });
}

function InlineCodeSnippetToken(text, parserContext) {
  this.type = 'inline_code';
  this.text = text.split('\\\\').map(s => s.replace('\\', '')).join('\\'); // remove single backslashes, and replace double with single;
}

function StrikethroughToken(text, parserContext, _, previousCharacter) {
  this.type = 'strikethrough';
  this.tokens = parseText({
    text,
    parserContext: parserContext.clone({ insideToken: true }).incrementCharacterNumber('~'.length)
  });
}

module.exports = {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken,
  ExternalLinkToken,
  ImageToken,
  FootnoteMarkerToken,
  HtmlToken,
  CodeBlockToken,
  BlockQuoteToken,
  OutlineToken,
  TableToken,
  TableListToken,
  FootnoteLinesToken,
  ItalicsToken,
  BoldToken,
  InlineCodeSnippetToken,
  StrikethroughToken
};
