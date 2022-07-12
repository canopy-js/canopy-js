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

let { removeMarkdownTokens, capitalize, GlobalLinkNeedingAddingToNamespacesError } = require('./helpers');

function localReferenceMatcher(string, parsingContext) {
  let { topicSubtopics, currentTopicCaps, currentSubtopicCaps, subtopicParents, redundantLocalReferences } = parsingContext;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  if (linkFragment) return;
  let currentStringAsKey = removeMarkdownTokens(linkTarget).toUpperCase();
  subtopicParents[currentTopicCaps] = subtopicParents[currentTopicCaps] || {};

  if (topicSubtopics[currentTopicCaps].hasOwnProperty(currentStringAsKey)) {
    if (subtopicParents[currentTopicCaps][currentStringAsKey]) {
      redundantLocalReferences.push([
        subtopicParents[currentTopicCaps][currentStringAsKey],
        currentSubtopicCaps,
        currentTopicCaps,
        currentStringAsKey
      ]);
    }

    subtopicParents[currentTopicCaps][currentStringAsKey] = currentSubtopicCaps;

    if (currentSubtopicCaps !== currentStringAsKey && currentTopicCaps !== currentStringAsKey) {
      return new LocalReferenceToken(
        topicSubtopics[currentTopicCaps][currentTopicCaps].mixedCase,
        topicSubtopics[currentTopicCaps][currentStringAsKey].mixedCase,
        topicSubtopics[currentTopicCaps][currentTopicCaps].mixedCase,
        topicSubtopics[currentTopicCaps][currentSubtopicCaps].mixedCase,
        linkText,
        fullText.length
      );
    } else {
      return null;
    }
  }
}

function globalReferenceMatcher(string, parsingContext) {
  let { topicSubtopics, currentTopicCaps, currentSubtopicCaps } = parsingContext;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  if (linkFragment) return;
  let stringAsCapsKey = removeMarkdownTokens(linkTarget).toUpperCase();

  if (topicSubtopics.hasOwnProperty(stringAsCapsKey)) {
    return new GlobalReferenceToken(
      topicSubtopics[stringAsCapsKey][stringAsCapsKey].mixedCase,
      topicSubtopics[stringAsCapsKey][stringAsCapsKey].mixedCase,
      topicSubtopics[currentTopicCaps][currentTopicCaps].mixedCase,
      topicSubtopics[currentTopicCaps][currentSubtopicCaps].mixedCase,
      linkText,
      fullText.length
    );
  } else {
    return null;
  }
}

function importReferenceMatcher(string, parsingContext) {
  let {
    topicSubtopics,
    currentTopicCaps,
    currentSubtopicCaps,
    topicReferences,
    importReferencesToCheck
  } = parsingContext;

  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  let { targetTopicCaps, targetSubtopicCaps } = determineTopicAndSubtopic(linkTarget, linkFragment);


  if (!targetTopicCaps) {
    topicReferences.map(topicName => removeMarkdownTokens(topicName.toUpperCase())).forEach(topicName => {
      if ((topicSubtopics[topicName]||{}).hasOwnProperty(targetSubtopicCaps)) {
        if (targetTopicCaps) {
          console.error(`Error: Import reference ${fullText} in [${currentTopicCaps}, ${currentSubtopicCaps}] omits topic with multiple matching topic references.`)
          console.error(`Try using the explicit import reference syntax, eg [[Topic#Subtopic]]`);
          process.exit();
        }
        targetTopicCaps = topicName;
      }
    });
    if (!targetTopicCaps) {
      console.error(`Error: Reference ${fullText} in [${currentTopicCaps}, ${currentSubtopicCaps}] matches no global, local, or import reference.`)
      process.exit();
    }
  }

  importReferencesToCheck.push([currentTopicCaps, currentSubtopicCaps, targetTopicCaps, targetSubtopicCaps]);

  return new ImportReferenceToken(
    topicSubtopics[targetTopicCaps][targetTopicCaps].mixedCase,
    topicSubtopics[targetTopicCaps][targetSubtopicCaps].mixedCase,
    topicSubtopics[currentTopicCaps][currentTopicCaps].mixedCase,
    topicSubtopics[currentTopicCaps][currentSubtopicCaps].mixedCase,
    linkText,
    fullText.length
  );
}

function parseLink(string) {
  // Match [[a]] or [[a#b]] or [[a|b]] or [[a#b|c]]
  let match = string.match(/^\[\[([^|#\[\]]+)(?:#([^|#\[\]]+))?(?:\|([^|#\[\]]+))?\]\]/);

  return {
    linkTarget: match && match[1] || null,
    linkFragment: match && match[2] || null,
    linkText: match && (match[3] || match[2] || match[1] || null),
    fullText: match && match[0]
  }
}

function determineTopicAndSubtopic(linkTarget, linkFragment) {
  let stringAsCapsKey = removeMarkdownTokens(linkTarget).toUpperCase();

  let targetTopicCaps, targetSubtopicCaps;
  if (linkFragment) {
    targetTopicCaps = removeMarkdownTokens(linkTarget.toUpperCase());
    targetSubtopicCaps = removeMarkdownTokens(linkFragment.toUpperCase());
  } else {
    targetTopicCaps = null;
    targetSubtopicCaps = removeMarkdownTokens(linkTarget.toUpperCase())
  }

  return {
    targetTopicCaps,
    targetSubtopicCaps
  }
}

function escapedCharacterMatcher(string) {
  let match = string.match(/^\\(.)/);
  if (match) {
    return new TextToken(match[1], match[0].length);
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

function hyperlinkMatcher(string, parsingContext) {
  let match = string.match(/^\[([^!\s\]]+)\](?:\(([^)]*)\))/);

  if (match) {
    return [
      new UrlToken(match[1], match[2]),
      match[0].length
    ];
  }
}

function urlMatcher(string, parsingContext) {
  let match = string.match(/^(\S+:\/\/\S+[^.\s])/);
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
    ];
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
    ];
  }
}

function textMatcher(string) {
  return new TextToken(string, string.length);
}

module.exports = Matchers;
