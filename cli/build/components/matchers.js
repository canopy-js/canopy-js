let {
  LocalReferenceToken,
  GlobalReferenceToken,
  DisabledReferenceToken,
  ExternalLinkToken,
  ImageToken,
  FootnoteMarkerToken,
  HtmlToken,
  CodeBlockToken,
  BlockQuoteToken,
  ListToken,
  TableToken,
  MenuToken,
  FootnoteLinesToken,
  ItalicsToken,
  BoldToken,
  InlineCodeSnippetToken,
  UnderlineToken,
  ToolTipToken,
  CenterBlockToken
} = require('./tokens');

const Matchers = [
  escapedNewlineMatcher,
  escapedCharacterMatcher,
  fenceCodeBlockMatcher,
  prefixCodeBlockMatcher,
  blockQuoteMatcher,
  listMatcher,
  tableMatcher,
  menuMatcher,
  htmlMatcher,
  htmlEntityMatcher,
  footnoteLinesMatcher,
  localReferenceMatcher,
  globalReferenceMatcher,
  disabledReferenceMatcher,
  fragmentReferenceMatcher,
  footnoteMarkerMatcher,
  italicsMatcher,
  boldMatcher,
  codeSnippetMatcher,
  underlineMatcher,
  imageMatcher,
  hyperlinkMatcher,
  urlMatcher,
  toolTipMatcher,
  centerBlockMatcher
];

const chalk = require('chalk');

let Topic = require('../../shared/topic');
let { splitOnPipes } = require('../../shared/simple-helpers');
let Reference = require('./reference');
const { Parser } = require('htmlparser2');

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

function listMatcher({ string, parserContext, startOfLine }) {
  let match = string.match(/^(\s*(((?:[0-9+*-]{1,3}|[a-zA-Z])\.)|[+*-])([ ]+[^\n]+)(\n|$))+/s);

  if (match && startOfLine) {
    return [
      new ListToken(match[0], parserContext),
      match[0].length
    ];
  }
}

function tableMatcher({ string, parserContext, startOfLine }) {
  let match = string.match(/^(?:(?:\|(?:[^\n]*\|))\s*(?:\n|$))+/);
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

function menuMatcher({ string, parserContext, startOfLine }) {
  if (!string.match(/\n[-=<]+(\n|$)/)) return; // check the end first to avoid catastrophic backtracking
  let match = string.match(/^[=\-<]+\s*\n((([-<>] ?|[\w\d]+\.\s)[^\n]*\n)+)[=\-<]+\s*\n?/);
  if (!match) return null;

  if (match && startOfLine) {
    return [
      new MenuToken(match[0], parserContext),
      match[0].length
    ];
  }
}

function htmlMatcher({ string, parserContext }) {
  // Check if the string starts with whitespace
  if (string[0] && /\s/.test(string[0])) {
    return null; // Disqualify match if it begins with whitespace
  }

  // Check if the string starts with a '<' character
  if (string[0] !== '<') {
    return null; // Fragment must start with a tag
  }

  let openTags = [];
  let isBalanced = true;
  let fragmentEndIndex = -1;

  // Create a parser instance
  const parser = new Parser(
    {
      onopentag(name) {
        openTags.push(name);
      },
      onclosetag(name) {
        if (
          openTags.length === 0 ||
          openTags[openTags.length - 1] !== name
        ) {
          isBalanced = false;
          parser.pause(); // Stop parsing if tags are unbalanced
        } else {
          openTags.pop();
          if (openTags.length === 0) {
            // All tags are closed; record the position
            fragmentEndIndex = parser.endIndex + 1; // +1 to include the closing tag
            // Do not pause here; allow parser to check for plaintext
          }
        }
      },
      ontext() {
        if (openTags.length === 0) {
          // If no fragment end index has been set, disqualify the match
          if (fragmentEndIndex === -1) {
            fragmentEndIndex = -1;
          } else {
            // Adjust fragmentEndIndex to exclude the plaintext
            fragmentEndIndex = Math.min(
              fragmentEndIndex,
              parser.startIndex
            );
          }
          parser.pause();
        }
      },
      onend() {
        // Ensure we have a fragment if the string ends after tags are closed
        if (
          openTags.length === 0 &&
          isBalanced &&
          fragmentEndIndex === -1
        ) {
          fragmentEndIndex = parser.endIndex + 1;
        }
      },
      onerror() {
        isBalanced = false;
        parser.pause();
      },
    },
    {
      decodeEntities: false,
      recognizeSelfClosing: true
    }
  );

  // Parse the substring starting from startIndex
  const substringToParse = string.substring(0);
  parser.parseComplete(substringToParse);

  if (fragmentEndIndex !== -1 && isBalanced) {
    // Build the fragment
    let fragment = string.substring(0, fragmentEndIndex);

    // Redundantly check if fragment starts and ends with a tag
    let startsWithTag = fragment.startsWith('<');
    let endsWithTag = fragment.endsWith('>');

    if (!startsWithTag || !endsWithTag) {
      return null; // Fragment must start and end with a tag
    }

    // Determine consumed length
    let consumedLength = fragmentEndIndex;

    return [new HtmlToken(fragment, parserContext), consumedLength];
  }

  // No valid fragment found
  return null;
}

function centerBlockMatcher({ string, startOfLine, parserContext }) {
  if (!startOfLine) return;
  if (!string.startsWith(':::')) return;

  const tail = string.slice(3);
  const m = tail.match(/:::\s*(?=\n|$)/);
  if (!m) return;

  const closeIndex = 3 + m.index;
  const fullLen = closeIndex + m[0].length;
  const content = string.slice(3, closeIndex);

  return [
    new CenterBlockToken(content, parserContext),
    fullLen
  ];
}

function htmlEntityMatcher({ string, parserContext }) {
  let match = string.match(/^&[a-zA-Z]+;/s);

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
  if (parserContext.noLinks) return;
  if (!Reference.candidateSubstring(string)) return;
  let { currentTopic, currentSubtopic } = parserContext;

  let reference = Reference.for(Reference.candidateSubstring(string), parserContext);

  if (!reference.valid) return;
  if (!reference.simpleTarget) return; // eg [[A]] or [[A|B]] not [[A#B/C#D]] or [[A#B/C#D|XYZ]]
  if (!reference.targetText) return; // Eg someone accidentally did [[]] or [[|XYZ]]

  let potentialSubtopic = Topic.for(reference.targetText);
  if (!potentialSubtopic) return; // subsumption dependent error
  if (potentialSubtopic.caps === currentTopic.caps) return; // this is a global self-reference, the root subtopic cannot be local-referenced
  if (potentialSubtopic.caps === currentSubtopic.caps) return; // a subtopic can't link to itself, perhaps a global topic by same name

  if (parserContext.currentTopicHasSubtopic(potentialSubtopic)) {
    if (parserContext.subtopicReferenceIsRedundant(potentialSubtopic)) {
      parserContext.registerPotentialRedundantLocalReference(potentialSubtopic, reference);
    }

    let localReferenceToken = new LocalReferenceToken(
      currentTopic.mixedCase,
      parserContext.getOriginalSubtopic(currentTopic, potentialSubtopic).mixedCase,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      reference.displayText,
      parserContext
    );

    parserContext.registerLocalReference(potentialSubtopic, index, reference, localReferenceToken);

    return [localReferenceToken, reference.fullText.length];
  } else {
    return null;
  }
}

function globalReferenceMatcher({ string, parserContext }) {
  if (parserContext.noLinks) return;
  if (!Reference.candidateSubstring(string)) return;
  let { currentTopic, currentSubtopic } = parserContext;
  
  let reference = Reference.for(Reference.candidateSubstring(string), parserContext);
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

function disabledReferenceMatcher({ string, parserContext }) {
  let match = string.match(/^\[!\[(?:\\.|(?!]]).)+]]/s);
  let { currentTopic, currentSubtopic } = parserContext;

  if (match) {
    let reference = Reference.for('[[' + match[0].slice('[!['.length), parserContext);

    return [new DisabledReferenceToken(
      reference.displayText,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      parserContext
    ),
    match[0].length];
  }
}

function fragmentReferenceMatcher({ string, parserContext }) {
  let match = string.match(/^\[#\[(?:\\.|(?!]]).)+]]/s);
  let { currentTopic, currentSubtopic } = parserContext;

  if (match) {
    let reference = Reference.for('[[' + match[0].slice('[#['.length), parserContext);
    if (!reference.simpleTarget) throw new Error(chalk.red(`Fragment reference ${reference.fullText} does not have simple target.\n${parserContext.filePathAndLineNumber}`));

    parserContext.registerFragmentReference(reference, currentSubtopic);

    return [new LocalReferenceToken(
      currentTopic.mixedCase,
      reference.targetAsTopic.mixedCase,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      reference.displayText,
      parserContext
    ),
    match[0].length];
  }
}

function escapedCharacterMatcher({ string, parserContext }) {
  let match = string.match(/^\\(.)/s);
  if (match) {
    parserContext.buffer += match[1];

    return [null, match[0].length];
  }
}

function escapedNewlineMatcher({ string }) {
  let match = string.match(/^\\\n/s);
  if (match) {
    return [null, match[0].length];
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

function urlMatcher({ string }) {
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
  let containsSpaces = match?.[1].match(/\s/s);

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
  let containsSpaces = match?.[1].match(/\s/s);

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

function underlineMatcher({ string, parserContext, previousCharacter }) {
  let strictPreviousCharacter = previousCharacter === undefined || !previousCharacter.match(/[A-Za-z0-9]/);
  let match = string.match(/^~(.*?[^\\])~(.|$)/s);
  let strictNextCharacter = (match?.[2] !== undefined) && !match?.[2].match(/[A-Za-z0-9]/); // nextChar is null, or non-alpha-numeric
  let containsSpaces = match?.[1].match(/\s/s);

  let matchExists = match &&
    ((strictPreviousCharacter && strictNextCharacter) || // either ~ is at the edges of a word, in which case selected text can contain spaces
      !containsSpaces); // or ~ is within a word, and the struck through region may not contain spaces


  if (matchExists) {
    return [
      new UnderlineToken(
        match[1],
        parserContext
      ),
      match[0].length - match?.[2].length
    ];
  }
}

function toolTipMatcher({ string, parserContext }) {
  let match = string.match(/^ ?(\{!\s?)((?:[^\\}]|\\.)+)\}/s);
  if (match) {
    return [
      new ToolTipToken(
        match[2],
        match[1],
        parserContext
      ),
      match[0].length
    ];
  }
}

module.exports = Matchers;
