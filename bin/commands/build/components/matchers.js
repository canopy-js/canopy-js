let {
  LocalReferenceToken,
  GlobalReferenceToken,
  ImportReferenceToken,
  TextToken,
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
  htmlMatcher
];

let Topic = require('../../shared/topic');

function localReferenceMatcher(string, parserContext, index) {
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
      linkText
    );

    parserContext.registerLocalReference(targetSubtopic, index, linkText, localReferenceToken);

    return [localReferenceToken, fullText.length];
  } else {
    return null;
  }
}

function globalReferenceMatcher(string, parserContext) {
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
        linkText
      ), fullText.length
    ];
  } else {
    return null;
  }
}

function importReferenceMatcher(string, parserContext, index) {
  let { currentTopic, currentSubtopic } = parserContext.currentTopicAndSubtopic;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return; // not a well-formed link
  let { targetTopic, targetSubtopic } = determineTopicAndSubtopic(linkTarget, linkFragment);
  if (!targetTopic) { // The user chose to just give the subtopic and imply the topic by proximity
    targetTopic = parserContext.findImportReferenceTargetTopic(targetSubtopic, index);
  }

  if (!targetTopic) {
    throw `Error: ${parserContext.filePath}:${parserContext.lineNumber}\n` +
      `Reference ${fullText} in [${currentTopic.mixedCase}, ${currentSubtopic.mixedCase}] matches no global, local, or import reference.`;
  }

  if (!parserContext.topicExists(targetTopic)) {
    throw `Error: ${parserContext.filePath}:${parserContext.lineNumber}\n` +
      `Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existant topic [${targetTopic.mixedCase}]`;
  }

  if (!parserContext.topicHasSubtopic(targetTopic, targetSubtopic)) {
    throw `Error: ${parserContext.filePath}:${parserContext.lineNumber}\n` +
      `Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existant subtopic of [${targetTopic.mixedCase}]`;
  }

  parserContext.registerImportReference(currentTopic, currentSubtopic, targetTopic, targetSubtopic);

  return [
    new ImportReferenceToken(
      parserContext.getOriginalTopic(targetTopic).mixedCase,
      parserContext.getOriginalSubTopic(targetTopic, targetSubtopic).mixedCase,
      currentTopic.mixedCase,
      currentSubtopic.mixedCase,
      linkText
    ), fullText.length
  ];
}

function parseLink(string) {
  // Match [[a]] or [[a#b]] or [[a|b]] or [[a#b|c]] or [[number\#3#number\#4]]
  let match = string.
    replace(/\\#/g, '__LITERAL_AMPERSAND__').
    match(/^\[\[([^|#\]]+)(?:#([^|#\]]+))?(?:\|([^|\]]+))?\]\]/);

  match = match?.map(string => string?.replace(/__LITERAL_AMPERSAND__/g, '\\#'));

  return {
    linkTarget: match && match[1] || null, // eg "France"
    linkFragment: match && match[2] || null, // eg "Paris"
    linkText: match && (match[3] || match[2] || match[1] || null), // The specified link text, defaulting to subtopic
    fullText: match && match[0] // the whole reference eg "[[France#Paris]]""
  };
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
  };
}

function escapedCharacterMatcher(string, parserContext) {
  let match = string.match(/^\\(.)/);
  if (match) {
    parserContext.buffer += match[0];
    return [null, match[0].length]
  } else {
    return null;
  }
}

function footnoteMatcher(string) {
  let match = string.match(/^\[\^([^\]]+)\]/);
  if (match) {
    return [
      new FootnoteToken(match[1]),
      match[0].length
    ];
  }
}

function hyperlinkMatcher(string) {
  let match = string.match(/^\[([^!\]]+)\](?:\(([^)]*)\))/);
  if (match) {
    let [_, text, url] = match;
    return [
      new UrlToken(url, text),
      match[0].length
    ];
  }
}

function urlMatcher(string) {
  let match = string.match(/^(\S+:\/\/\S+[^.,;!\s])/);
  if (match) {
    return [
      new UrlToken(match[1]),
      match[1].length
    ];
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
    ];
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
    ];
  }
}

function htmlMatcher(string) {
  let match = string.match(/^<([^>]+)>([\s\S]*<\/\1>)?/);

  if (match) {
    return [
      new HtmlToken(
        match[0]
      ),
      match[0].length
    ];
  }
}

module.exports = Matchers;
