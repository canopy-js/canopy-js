let {
  LocalReferenceToken,
  GlobalReferenceToken,
  ImportReferenceToken,
  TextToken,
  markdownItalicMarkerToken,
  markdownBoldMarkerToken,
  markdownCodeMarkerToken,
  markdownUrlToken,
  markdownImageToken,
  markdownFootnoteToken,
  markdownHtmlToken
} = require('./tokens');

const Matchers = [
  localReferenceMatcher,
  globalReferenceMatcher,
  importReferenceMatcher,
  escapedCharacterMatcher,
  markdownFootnoteMatcher,
  markdownImageMatcher,
  markdownHyperlinkMatcher,
  markdownUrlMatcher,
  markdownLinkedImageMatcher,
  markdownHtmlMatcher,
]

let { removeMarkdownTokens, capitalize, GlobalLinkNeedingAddingToNamespacesError } = require('./helpers');

function localReferenceMatcher(string, parsingContext) {
  let { topicSubtopics, currentTopicCaps, currentSubtopicCaps, subtopicParents } = parsingContext;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  if (linkFragment) return;
  let currentStringAsKey = removeMarkdownTokens(linkTarget).toUpperCase();

  if (!subtopicParents[currentTopicCaps]) subtopicParents[currentTopicCaps] = {};
  subtopicParents[currentTopicCaps][currentStringAsKey] = currentSubtopicCaps;

  if (topicSubtopics[currentTopicCaps].hasOwnProperty(currentStringAsKey)) {
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
    if (currentTopicCaps !== stringAsCapsKey) {

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

function markdownFootnoteMatcher(string) {
  let match = string.match(/^\[\^([^\]]+)\]/);
  if (match) {
    return new markdownFootnoteToken(
      match[1],
      match[0].length
    )
  }
}

function markdownHyperlinkMatcher(string, parsingContext) {
  let match = string.match(/^\[([^!\s\]]+)\](?:\(([^)]*)\))/);

  if (match) {
    return new markdownUrlToken(
      match[1],
      match[2],
      match[0].length
    )
  }
}

function markdownUrlMatcher(string, parsingContext) {
  let match = string.match(/^(\S+:\/\/\S+[^.\s])/);
  if (match) {
    return new markdownUrlToken(
      match[1],
      match[1],
      match[0].length
    )
  }
}

function markdownImageMatcher(string) {
  let match = string.match(/^!\[([^\]]*)]\(([^\s]+)\s*(?:["']([^)]*)["'])?\)/);

  if (match) {
    return new markdownImageToken(
      match[1],
      match[2],
      match[3],
      null,
      match[0].length
    )
  }
}

function markdownLinkedImageMatcher(string) {
  let match = string.match(/^\[!\[([^\]]*)]\(([^\s]+)\s*"([^)]*)"\)\]\(([^)]*)\)/);

  if (match) {
    return new markdownImageToken(
      match[1],
      match[2],
      match[3],
      match[4],
      match[0].length
    )
  }
}

function markdownHtmlMatcher(string) {
  let match = string.match(/^<([^>]+)>[\s\S]*<\/([^>]+)>/);

  if (match) {
    return new markdownHtmlToken(
      match[0],
      match[0].length
    )
  }
}

function textMatcher(string) {
  return new TextToken(string, string.length);
}

module.exports = Matchers;
