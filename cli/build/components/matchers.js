let {
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
} = require('./tokens');

const Matchers = [
  fenceCodeBlockMatcher,
  prefixCodeBlockMatcher,
  blockQuoteMatcher,
  outlineMatcher,
  tableMatcher,
  htmlMatcher,
  footnoteLinesMatcher,
  localReferenceMatcher,
  globalReferenceMatcher,
  importReferenceMatcher,
  linkedImageMatcher,
  escapedCharacterMatcher,
  footnoteMarkerMatcher,
  imageMatcher,
  italicsMatcher,
  boldMatcher,
  codeSnippetMatcher,
  strikeThroughMatcher,
  hyperlinkMatcher,
  urlMatcher
];

let Topic = require('../../shared/topic');
let { displaySegment } = require('../../shared/helpers');
let chalk = require('chalk');
let { parseLink, determineTopicAndSubtopic } = require('./helpers');

function fenceCodeBlockMatcher({ string, startOfLine }) {
  let match = string.match(/^```\n(.*\n)```(\n|$)/s);

  if (match && startOfLine) {
    let text = match[1];
    if (text[text.length - 1] === "\n") text = text.slice(0, -1); // remove trailing newline

    return [
      new CodeBlockToken(text),
      match[0].length
    ];
  }
}

function prefixCodeBlockMatcher({ string, startOfLine }) {
  let match = string.match(/^(`((\n|$)| [^\n]*(\n|$)))+/s); // if there is content on the line, we require a space

  if (match && startOfLine) {
    let text = match[0].split(/(?<=^|\n)` ?/).join('');
    if (text[text.length - 1] === "\n") text = text.slice(0, -1); // remove trailing newline

    return [
      new CodeBlockToken(text),
      match[0].length
    ];
  }
}

function blockQuoteMatcher({ string, parserContext, startOfLine }) {
  let match =
    string.match(/^((<) [^\n]+(\n|$))+/s)
    || string.match(/^((>) [^\n]+(\n|$))+/s); // one direction or the other not a mix

  if (match && startOfLine) {
    let text = Array.from(
      match[0]
        .matchAll(/(?<=^|\n)(?:[><]) ?([^\n]+)/g))
        .map(m => m[1])
        .join('\n');

    if (text[text.length - 1] === "\n") text = text.slice(0, -1); // remove trailing newline
    let direction = match[2] === '>' ? 'ltr' : 'rtl';

    return [
      new BlockQuoteToken(text, direction, parserContext),
      match[0].length
    ];
  }
}

function outlineMatcher({ string, parserContext, startOfLine }) {
  let match = string.match(/^(\s*(([A-Za-z0-9+*-]{1,3}\.)|[+*-])([ ]+[^\n]+)(\n|$))+/s);

  if (match && startOfLine) {
    return [
      new OutlineToken(match[0], parserContext),
      match[0].length
    ];
  }
}

function tableMatcher({ string, parserContext, startOfLine }) {
  let match = string.match(/^(?:(?:\|(?:[^\n]*\|))(?:\n|$))+/);
  if (!match) return null;

  let lines = match[0].split(/\n/g).map(l => l.split(/(?<!\\)\|/).slice(1, -1)); // split rows by unescaped pipe characters
  if (!lines.every(l => l.length === lines[0].length)) return null; // all rows must have an equal number of cells
  if (!lines[1]?.every(c => c.match(/^[-=]*$/))) return null; // the second row cells must be all delimiters

  if (match && startOfLine) {
    return [
      new TableToken(match[0], parserContext),
      match[0].length
    ];
  }
}

function htmlMatcher({ string }) {
  let fragments = string.match(/(<[^>]+>|((?!<[^>]+>).)*)/gs);
  let result = null;

  fragments.forEach((fragment, index) => { // Look at eg <a><b><c> then <a><b> then <a> for balanced fragment
    let segment = fragments.slice(0, fragments.length - index).join('');

    let match = segment.match(/^<([^<> ]+)[^<>]*>(.*<[^>]+>)?/s);
    if (match) {
      let [_, openingTagName, doubleTag] = match;
      let singleTag = !doubleTag;

      let balancedFirstTag = !singleTag && (Array.from(match[0].matchAll(/<(\/?)([^<> ]+[^<>]*)>/gs)).slice(1).reduce((count, match) => {
        let [_, forwardSlash, tagName] = match;

        if (count === 0) return NaN; // if we've close the opening tag before finishing, reject the block eg <div></div><div></div>

        if (tagName.toLowerCase() === openingTagName.toLowerCase()) {
          if (forwardSlash) {
            count--;
          } else {
            count++;
          }
        }

        return count;

      }, 1) === 0); // if we end with zero having never hit zero in between, the outer tag is balanced eg <b><b></b></b> and not <b></b><b></b>

      if (singleTag || balancedFirstTag) {
        result = result || [
        new HtmlToken(match[0]),
          match[0].length
        ];
      }
    }
  });

  return result;
}

function footnoteLinesMatcher({ string, parserContext, startOfLine }) {
  let match = string.match(/^(\[\^[^\]]+]:[^\n]+(\n|$))+/s);

  if (match && startOfLine) {
    return [
      new FootnoteLinesToken(match[0], parserContext),
      match[0].length
    ];
  }
}

function localReferenceMatcher({ string, parserContext, index }) {
  let { currentTopic, currentSubtopic } = parserContext.currentTopicAndSubtopic;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);

  if (!linkTarget) return; // This is not a valid link
  if (linkFragment) return; // Any link with a # symbol is a global or import
  let targetSubtopic = new Topic(linkTarget);
  if (targetSubtopic.caps === currentTopic.caps) return; // this is a global self-reference, the root subtopic cannot be local-referenced

  if (parserContext.currentTopicHasSubtopic(targetSubtopic)) {
    if (parserContext.subtopicReferenceIsRedundant(targetSubtopic)) {
      let currentLinkCouldBeImport = parserContext.localReferenceCouldBeImport(targetSubtopic, index);
      let otherLinkCouldBeImport = parserContext.priorLocalReferenceCouldBeImport(targetSubtopic);

      if (currentLinkCouldBeImport && !otherLinkCouldBeImport) {
        return null; // allow text to be matched as import reference in importReferenceMatcher
      } else if (!currentLinkCouldBeImport && otherLinkCouldBeImport) {
        parserContext.convertPriorLocalReferenceToImport(targetSubtopic);
      } else {
        parserContext.registerPotentialRedundantLocalReference(targetSubtopic);
      }
    }

    let localReferenceToken = new LocalReferenceToken(
      currentTopic.mixedCase,
      parserContext.getOriginalSubTopic(currentTopic, targetSubtopic).mixedCase,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      linkText,
      parserContext
    );

    parserContext.registerLocalReference(targetSubtopic, index, linkText, localReferenceToken);

    return [localReferenceToken, fullText.length];
  } else {
    return null;
  }
}

function globalReferenceMatcher({ string, parserContext }) {
  let { currentTopic, currentSubtopic } = parserContext.currentTopicAndSubtopic;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return; // invalid link
  if (linkFragment && linkTarget !== linkFragment) return; // import reference
  let targetTopic = new Topic(linkTarget);

  if (parserContext.topicExists(targetTopic)) {
    parserContext.registerGlobalReference(targetTopic, currentTopic, currentSubtopic);

    return [
      new GlobalReferenceToken(
        parserContext.getOriginalTopic(targetTopic).mixedCase,
        parserContext.getOriginalTopic(targetTopic).mixedCase,
        currentTopic.mixedCase,
        currentSubtopic.mixedCase,
        linkText,
        parserContext
      ), fullText.length
    ];
  } else {
    return null;
  }
}

function importReferenceMatcher({ string, parserContext, index }) {
  let { currentTopic, currentSubtopic } = parserContext.currentTopicAndSubtopic;
  let { linkTarget, linkFragment, linkText, fullText, multiPipe } = parseLink(string);
  if (!linkTarget) return; // not a well-formed link
  let { targetTopic, targetSubtopic } = determineTopicAndSubtopic(linkTarget, linkFragment);
  if (!targetTopic) { // The user chose to just give the subtopic and imply the topic by proximity
    targetTopic = parserContext.findImportReferenceTargetTopic(targetSubtopic, index);
  }

  if (!targetTopic) {
    throw new Error(chalk.red(`Error: Reference ${fullText} ${multiPipe ? 'referencing target ['+linkTarget+'] ':''}in ${displaySegment(currentTopic.mixedCase, currentSubtopic.mixedCase)} matches no global, local, or import reference.\n` +
      `${parserContext.filePath}:${parserContext.lineNumber}` +
      (multiPipe ? '\n\nRemember, multi-pipe links are interpreted as [[text for both target and display|just target|just display|both|just target|just display]]' : '')));
  }

  if (!parserContext.topicExists(targetTopic)) {
    throw new Error(chalk.red(`Error: Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existent topic [${targetTopic.mixedCase}]\n` +
      `${parserContext.filePath}:${parserContext.lineNumber}`));
  }

  if (!parserContext.topicHasSubtopic(targetTopic, targetSubtopic)) {
    throw new Error(chalk.red(`Error: Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existent subtopic of [${targetTopic.mixedCase}], [${targetSubtopic.mixedCase}]\n` +
      `${parserContext.filePath}:${parserContext.lineNumber}`));
  }

  parserContext.registerImportReference(currentTopic, currentSubtopic, targetTopic, targetSubtopic);

  return [
    new ImportReferenceToken(
      parserContext.getOriginalTopic(targetTopic).mixedCase,
      parserContext.getOriginalSubTopic(targetTopic, targetSubtopic).mixedCase,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      linkText,
      parserContext
    ), fullText.length
  ];
}

function escapedCharacterMatcher({ string, parserContext }) {
  let match = string.match(/^\\(.)/);
  if (match) {
    parserContext.buffer += match[1];

    return [null, match[0].length]
  } else {
    return null;
  }
}

function footnoteMarkerMatcher({ string, startOfLine }) {

  let match = string.match(/^\[\^([^\]]+)\]/);
  if (match && !startOfLine) { // a footnote marker cannot start a line to distinguish from footnote line itself
    return [
      new FootnoteMarkerToken(match[1]),
      match[0].length
    ];
  }
}

function hyperlinkMatcher({ string, parserContext }) {
  let match = string.match(/^\[([^!\]]+)\](?:\(([^ )]*)\))/);
  if (match) {
    let [_, text, url] = match;
    return [
      new UrlToken(url, text, parserContext),
      match[0].length
    ];
  }
}

function urlMatcher({ string, parserContext }) {
  let match = string.match(/^([^/\s]+:\/\/\S+[^.,;!\s])/);
  if (match) {
    return [
      new UrlToken(match[1]),
      match[0].length
    ];
  }
}

function imageMatcher({ string, parserContext }) {
  let match = string.match(/^!\[([^\]]*)]\(([^\s]+)\s*(?:["']((?:.(?!" "))+.)["'](?: ["']((?:.(?![^\\]"))*..)["'])?)?\)/);
  if (match) {
    return [
      new ImageToken(
        {
          alt: match[1],
          resourceUrl:
          match[2],
          title: match[3],
          caption: match[4],
          parserContext
        }
      ), match[0].length
    ];
  }
}

function linkedImageMatcher({ string, parserContext }) {
  let match = string.match(/^\[!\[([^\]]*)]\(([^\s]+)\s*(?:["']((?:.(?!" "))+.)["'](?: ["']((?:.(?![^\\]"))*..)["'])?)?\)\]\(([^)]*)\)/);

  if (match) {
    return [
      new ImageToken(
        {
          alt: match[1],
          resourceUrl:
          match[2],
          title: match[3],
          caption: match[5] && match[4],
          anchorUrl: match[5] || match[4],
          parserContext
        }
      ),
      match[0].length
    ];
  }
}

function italicsMatcher({ string, parserContext, previousCharacter }) {
  let validPreviousCharacter = previousCharacter === undefined || previousCharacter.match(/[\s_*`~"'([{}\]\)]/);
  let match = string.match(/^_((.*?[^\\]))_(?=[\s.,{*_`~"'{[(\]})]|$)/s);

  if (match && validPreviousCharacter) {
    return [
      new ItalicsToken(
        match[1],
        parserContext
      ),
      match[0].length
    ];
  }
}

function boldMatcher({ string, parserContext, previousCharacter }) {
  let validPreviousCharacter = previousCharacter === undefined || previousCharacter.match(/[\s_*`~"'([{}\]\)]/);
  let match = string.match(/^\*((.*?[^\\]))\*(?=[\s.,{*_`~"'{[(\]})]|$)/s);

  if (match && validPreviousCharacter) {
    return [
      new BoldToken(
        match[1],
        parserContext
      ),
      match[0].length
    ];
  }
}

function codeSnippetMatcher({ string, parserContext, _, previousCharacter }) {
  let validPreviousCharacter = previousCharacter === undefined || previousCharacter.match(/[\s_*`~"'([{}\]\)]/);
  let match = string.match(/^`((.*?[^\\]))`(?=[\s.,{*_`~"'{[(\]})]|$)/s);

  if (match && validPreviousCharacter) {
    return [
      new InlineCodeSnippetToken(
        match[1],
        parserContext
      ),
      match[0].length
    ];
  }
}

function strikeThroughMatcher({ string, parserContext, previousCharacter }) {
  let validPreviousCharacter = previousCharacter === undefined || previousCharacter.match(/[\s_*`~"'([{}\]\)]/);
  let match = string.match(/^~((.*?[^\\]))~(?=[\s.,{*_`~"'{[(\]})]|$)/s);

  if (match && validPreviousCharacter) {
    return [
      new StrikethroughToken(
        match[1],
        parserContext
      ),
      match[0].length
    ];
  }
}

module.exports = Matchers;
