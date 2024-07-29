let {
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
  StrikethroughToken,
  TextLineToken
} = require('./tokens');

const Matchers = [
  escapedCharacterMatcher,
  fenceCodeBlockMatcher,
  prefixCodeBlockMatcher,
  blockQuoteMatcher,
  outlineMatcher,
  tableMatcher,
  tableListMatcher,
  htmlMatcher,
  htmlEntityMatcher,
  footnoteLinesMatcher,
  localReferenceMatcher,
  globalReferenceMatcher,
  footnoteMarkerMatcher,
  italicsMatcher,
  boldMatcher,
  codeSnippetMatcher,
  strikeThroughMatcher,
  imageMatcher,
  hyperlinkMatcher,
  urlMatcher,
  textLineMatcher
];

let Topic = require('../../shared/topic');
let { displaySegment, splitOnPipes } = require('../../shared/simple-helpers');
let chalk = require('chalk');
let Reference = require('./reference');

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
    let text = [...match[0].matchAll(/^` ?([^\n]*)/gm)].map(m => m[1]).join('\n');
    // if (text[text.length - 1] === "\n") text = text.slice(0, -1); // remove trailing newline

    return [
      new CodeBlockToken(text),
      match[0].length
    ];
  }
}

function blockQuoteMatcher({ string, parserContext, startOfLine }) {
  let match =
    string.match(/^((<)(?: [^\n]+|(?=\n))(\n|$))+/s)
    || string.match(/^((>)(?: [^\n]+|(?=\n))(\n|$))+/s); // one direction or the other not a mix

  if (match && startOfLine) {
    let text = Array.from(
      match[0]
        .matchAll(/(?:^|\n)(?:[><])(?: ([^\n]+)|(?=\n))/g))
        .map(m => m?.[1] || '')
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
  let match = string.match(/^(\s*(((?:[0-9+*-]{1,3}|[a-zA-Z])\.)|[+*-])([ ]+[^\n]+)(\n|$))+/s);

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
  let tableMatch = match[0];
  if (tableMatch.endsWith('\n')) tableMatch = tableMatch.slice(0, -1);

  let lines = tableMatch.split(/\n/g).map(l => splitOnPipes(l)); // split rows by unescaped pipe characters
  if (!lines.every(l => l.length === lines[0].length)) return null; // all rows must have an equal number of cells

  if (match && startOfLine) {
    return [
      new TableToken(tableMatch, parserContext),
      tableMatch.length
    ];
  }
}

function tableListMatcher({ string, parserContext, startOfLine }) {
  if (!string.match(/\n[-=<]+(\n|$)/)) return; // check the end first to avoid catastrophic backtracking
  let match = string.match(/^[=\-<]+\n((([-<>] ?|[\w\d]+\.\s)[^\n]*\n)+)[=\-<]+\n?/);
  if (!match) return null;

  if (match && startOfLine) {
    return [
      new TableListToken(match[0], parserContext),
      match[0].length
    ];
  }
}

function htmlMatcher({ string, parserContext }) {
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
        new HtmlToken(match[0], parserContext),
          match[0].length
        ];
      }
    }
  });

  return result;
}

function htmlEntityMatcher({ string, parserContext }) {
  let match = string.match(/^&.+;/s);

  if (match) {
    return [
      new HtmlToken(match[0], parserContext),
      match[0].length
    ];
  }
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
  let { currentTopic, currentSubtopic } = parserContext;
  if (!Reference.candidateSubstring(string)) return;

  let reference = Reference.for(Reference.candidateSubstring(string), currentTopic, parserContext);

  if (!reference.valid) return;
  if (!reference.simpleTarget) return; // eg [[A]] or [[A|B]] not [[A#B/C#D]] or [[A#B/C#D|XYZ]]
  if (!reference.targetText) return; // Eg someone accidentally did [[]] or [[|XYZ]]

  let potentialSubtopic = Topic.for(reference.targetText);
  if (!potentialSubtopic) return; // subsumption dependent error
  if (potentialSubtopic.caps === currentTopic.caps) return; // this is a global self-reference, the root subtopic cannot be local-referenced
  if (potentialSubtopic.caps === currentSubtopic.caps) return; // a subtopic can't link to itself, perhaps a global topic by same name

  if (parserContext.currentTopicHasSubtopic(potentialSubtopic)) {
    if (parserContext.subtopicReferenceIsRedundant(potentialSubtopic)) {
      parserContext.registerPotentialRedundantLocalReference(potentialSubtopic);
    }

    let localReferenceToken = new LocalReferenceToken(
      currentTopic.mixedCase,
      parserContext.getOriginalSubtopic(currentTopic, potentialSubtopic).mixedCase,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      reference.displayText,
      parserContext
    );

    parserContext.registerLocalReference(potentialSubtopic, index, reference.contents, string, localReferenceToken);

    return [localReferenceToken, reference.fullText.length];
  } else {
    return null;
  }
}

function globalReferenceMatcher({ string, parserContext }) {
  let { currentTopic, currentSubtopic } = parserContext;
  if (!Reference.candidateSubstring(string)) return;
  let reference = Reference.for(Reference.candidateSubstring(string), currentTopic, parserContext);
  if (!reference.valid) return;
  let pathString = reference.pathString;

  parserContext.registerGlobalReference(pathString, reference, reference.fullText);

  return [
    new GlobalReferenceToken(
      pathString,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      reference.displayText,
      parserContext
    ), reference.fullText.length
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
  let match = string.match(/^\[((?:\\.|!\[(?:\\.|[^\\])+?\)|[^\\])+?)\](?:\(((?:\\[^ ]|[^\\ ])+))\)/); // non-greedy unless text looks like nested image
  if (match) {
    let [_, text, url] = match;
    return [
      new ExternalLinkToken(url, text, parserContext),
      match[0].length
    ];
  }
}

function urlMatcher({ string, parserContext }) {
  let match = string.match(/^([A-Za-z0-9+\-.]+:\/\/\S+[^.,;!\s])/);
  if (match) {
    return [
      new ExternalLinkToken(match[1]),
      match[0].length
    ];
  }
}

function imageMatcher({ string, parserContext }) {
  let match = string.match(/^!\[((?:\\.|[^\\])*?)\]\((\S+?)\s*(?:["'“”]((?:\\.|[^\\"'“”])*?)(?:"|”)(?: ["'“”]((?:\\.|[^\\])*?)["'“”])?)?\)/);

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

function italicsMatcher({ string, parserContext, previousCharacter }) {
  let strictPreviousCharacter = previousCharacter === undefined || !previousCharacter.match(/[A-Za-z0-9]/);
  let match = string.match(/^_(.*?[^\\])_(.|$)/s);
  let strictNextCharacter = (match?.[2] !== undefined) && !match?.[2].match(/[A-Za-z0-9]/); // nextChar is null, or non-alpha-numeric
  let containsSpaces = match?.[0].match(/\s/s);

  let matchExists = match &&
    ((strictPreviousCharacter && strictNextCharacter) || // either _ is at the edges of a word, in which case selected text can contain spaces
      !containsSpaces); // or _ is within a word, and the italicized region may not contain spaces

  if (matchExists) {
    return [
      new ItalicsToken(
        match[1],
        parserContext
      ),
      match[0].length - match?.[2].length
    ];
  }
}

function boldMatcher({ string, parserContext, previousCharacter }) {
  let strictPreviousCharacter = previousCharacter === undefined || !previousCharacter.match(/[A-Za-z0-9]/);
  let match = string.match(/^\*(.*?[^\\])\*(.|$)/s);
  let strictNextCharacter = (match?.[2] !== undefined) && !match?.[2].match(/[A-Za-z0-9]/); // nextChar is null, or non-alpha-numeric
  let containsSpaces = match?.[0].match(/\s/s);

  let matchExists = match &&
    ((strictPreviousCharacter && strictNextCharacter) || // either * is at the edges of a word, in which case selected text can contain spaces
      !containsSpaces); // or * is within a word, and the bolded region may not contain spaces

  if (matchExists) {
    return [
      new BoldToken(
        match[1],
        parserContext
      ),
      match[0].length - match?.[2].length
    ];
  }
}

function codeSnippetMatcher({ string, parserContext, _, previousCharacter }) {
  let validPreviousCharacter = previousCharacter === undefined || !previousCharacter.match(/[A-Za-z0-9]/);
  let match = string.match(/^`(.*?[^\\])`(?=.|$)/s);

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
  let strictPreviousCharacter = previousCharacter === undefined || !previousCharacter.match(/[A-Za-z0-9]/);
  let match = string.match(/^~(.*?[^\\])\~(.|$)/s);
  let strictNextCharacter = (match?.[2] !== undefined) && !match?.[2].match(/[A-Za-z0-9]/); // nextChar is null, or non-alpha-numeric
  let containsSpaces = match?.[0].match(/\s/s);

  let matchExists = match &&
    ((strictPreviousCharacter && strictNextCharacter) || // either ~ is at the edges of a word, in which case selected text can contain spaces
      !containsSpaces); // or ~ is within a word, and the struck through region may not contain spaces


  if (matchExists) {
    return [
      new StrikethroughToken(
        match[1],
        parserContext
      ),
      match[0].length - match?.[2].length
    ];
  }
}

function textLineMatcher({ string, parserContext, startOfLine, startOfText }) { // When parsing text tokens, group by line
  let match = string.match(/^((?:[^\\\n]|\\.)+)(?:\n|$)/);
  if (parserContext.insideToken) return false;
  if (parserContext.buffer) return false;
  let matchIsAllText = startOfText && match[0].length === string.length;

  if (match && startOfLine && !matchIsAllText) { // don't let a text line be the full text
    return [
      new TextLineToken(
        match[1],
        parserContext
      ),
      match[0].length
    ];
  }

}

module.exports = Matchers;
