let {
  LocalReferenceToken,
  GlobalReferenceToken,
  ImportReferenceToken,
  TextToken,
  ItalicMarkerToken,
  BoldMarkerToken,
  CodeMarkerToken,
  UrlToken,
  ImageToken,
  FootnoteToken,
  HtmlToken
} = require('./tokens');

const Matchers = [
  localReferenceMatcher,
  globalReferenceMatcher,
  importReferenceMatcher,
  escapedCharacterMatcher,
  footnoteMatcher,
  imageMatcher,
  hyperlinkMatcher,
  urlMatcher,
  linkedImageMatcher,
  htmlMatcher,
]

let Topic = require('../../shared/topic');

function localReferenceMatcher(string, parserState, index) {
  let { currentTopic, currentSubtopic } = parserState.currentTopicAndSubtopic;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return; // This is not a valid link
  if (linkFragment) return; // Any link with a # symbol is a global or import
  let targetSubtopic = new Topic(linkTarget);
  if (targetSubtopic.caps === currentTopic.caps) return; // this is a global self-reference, the root subtopic cannot be local-referenced
  if (parserState.currentTopicHasSubtopic(targetSubtopic)) {
    if (parserState.subtopicReferenceIsRedundant(targetSubtopic)) {
      let currentLinkCouldBeImport = parserState.localReferenceCouldBeImport(targetSubtopic, index);
      let otherLinkCouldBeImport = parserState.priorLocalReferenceCouldBeImport(targetSubtopic);

      if (currentLinkCouldBeImport && !otherLinkCouldBeImport) {
        return null; // allow text to be matched as import reference in importReferenceMatcher
      } else if (!currentLinkCouldBeImport && otherLinkCouldBeImport) {
        parserState.convertPriorLocalReferenceToImport(targetSubtopic);
      } else {
        parserState.registerPotentialRedundantLocalReference(targetSubtopic);
      }
    }

    let localReferenceToken = new LocalReferenceToken(
        currentTopic.mixedCase,
        parserState.getOriginalSubTopic(currentTopic, targetSubtopic).mixedCase,
        currentTopic.mixedCase,
        currentSubtopic.mixedCase,
        linkText
      );

    parserState.registerLocalReference(targetSubtopic, index, linkText, localReferenceToken);

    return [localReferenceToken, fullText.length];
  } else {
    return null;
  }
}

function globalReferenceMatcher(string, parserState) {
  let { currentTopic, currentSubtopic } = parserState.currentTopicAndSubtopic;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return; // invalid link
  if (linkFragment && linkTarget !== linkFragment) return; // import reference
  let targetTopic = new Topic(linkTarget);

  if (parserState.topicExists(targetTopic)) {
    return [
      new GlobalReferenceToken(
        parserState.getOriginalTopic(targetTopic).mixedCase,
        parserState.getOriginalTopic(targetTopic).mixedCase,
        currentTopic.mixedCase,
        currentSubtopic.mixedCase,
        linkText
      ), fullText.length
    ];
  } else {
    return null;
  }
}

function importReferenceMatcher(string, parserState, index) {
  let { currentTopic, currentSubtopic } = parserState.currentTopicAndSubtopic;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return; // not a well-formed link
  let { targetTopic, targetSubtopic } = determineTopicAndSubtopic(linkTarget, linkFragment);
  if (!targetTopic) { // The user chose to just give the subtopic and imply the topic by proximity
    targetTopic = parserState.findImportReferenceTargetTopic(targetSubtopic, index);
  }

  if (!targetTopic) {
    throw `Error: Reference ${fullText} in [${currentTopic.mixedCase}, ${currentSubtopic.mixedCase}] matches no global, local, or import reference.`;
  }

  if (!parserState.topicExists(targetTopic)) {
    throw `Error: Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existant topic [${targetTopic.mixedCase}]`;
  }

  if (!parserState.topicHasSubtopic(targetTopic, targetSubtopic)) {
    throw `Error: Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existant subtopic of [${targetTopic.mixedCase}]`;
  }

  parserState.registerImportReference(currentTopic, currentSubtopic, targetTopic, targetSubtopic)

  return [
    new ImportReferenceToken(
      parserState.getOriginalTopic(targetTopic).mixedCase,
      parserState.getOriginalSubTopic(targetTopic, targetSubtopic).mixedCase,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      linkText
    ), fullText.length
  ];
}

function parseLink(string) {
  // Match [[a]] or [[a#b]] or [[a|b]] or [[a#b|c]] or [[number\#3#number\#4]]
  let match = string.match(/^\[\[((?:(?:\\.)|[^|#\[\]])+)(?:#((?:(?:\\.)|[^|#\[\]])+))?(?:\|([^|#\[\]]+))?\]\]/);

  return {
    linkTarget: match && match[1] || null, // eg "France"
    linkFragment: match && match[2] || null, // eg "Paris"
    linkText: match && (match[3] || match[2] || match[1] || null), // The specified link text, defaulting to subtopic
    fullText: match && match[0] // the whole reference eg "[[France#Paris]]""
  }
}

function determineTopicAndSubtopic(linkTarget, linkFragment) {
  let targetTopic, targetSubtopic;
  if (linkFragment) {
    targetTopic = new Topic(linkTarget);
    targetSubtopic = new Topic(linkFragment);
  } else {
    targetTopic = null;
    targetSubtopic = new Topic(linkTarget);
  }

  return {
    targetTopic,
    targetSubtopic
  }
}

function escapedCharacterMatcher(string) {
  let match = string.match(/^\\(.)/);
  if (match) {
    return [new TextToken(match[1]), match[0].length];
  }
}

function footnoteMatcher(string) {
  let match = string.match(/^\[\^([^\]]+)\]/);
  if (match) {
    return [
      new FootnoteToken(match[1]),
      match[0].length
    ]
  }
}

function hyperlinkMatcher(string) {
  let match = string.match(/^\[([^!\s\]]+)\](?:\(([^)]*)\))/);

  if (match) {
    return [
      new UrlToken(match[1], match[2]),
      match[0].length
    ]
  }
}

function urlMatcher(string) {
  let match = string.match(/^(\S+:\/\/\S+[^.\s])/);
  if (match) {
    return [
      new UrlToken(match[1]),
      match[1].length
    ]
  }
}

function imageMatcher(string) {
  let match = string.match(/^!\[([^\]]*)]\(([^\s]+)\s*(?:["']([^)]*)["'])?\)/);

  if (match) {
    return [
      new ImageToken(
        match[1],
        match[2],
        match[3],
        null
      ), match[0].length
    ]
  }
}

function linkedImageMatcher(string) {
  let match = string.match(/^\[!\[([^\]]*)]\(([^\s]+)\s*"([^)]*)"\)\]\(([^)]*)\)/);

  if (match) {
    return [
      new ImageToken(
        match[1],
        match[2],
        match[3],
        match[4]
      ),
      match[0].length
    ]
  }
}

function htmlMatcher(string) {
  let match = string.match(/^<([^>]+)>[\s\S]*<\/([^>]+)>/);

  if (match) {
    return [
      new HtmlToken(
        match[0]
      ),
      match[0].length
    ]
  }
}

function textMatcher(string) {
  return new TextToken(string, string.length);
}

module.exports = Matchers;
