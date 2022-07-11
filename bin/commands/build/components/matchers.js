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

let { GlobalLinkNeedingAddingToNamespacesError, TopicName } = require('./helpers');

function localReferenceMatcher(string, parsingContext) {
  let { topicSubtopics, currentTopic, currentSubtopic, subtopicParents, redundantLocalReferences } = parsingContext;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  if (linkFragment) return;
  let currentStringAsTopic = new TopicName(linkTarget);
  subtopicParents[currentTopic.caps] = subtopicParents[currentTopic.caps] || {};

  if (topicSubtopics[currentTopic.caps].hasOwnProperty(currentStringAsTopic.caps)) {
    if (subtopicParents[currentTopic.caps][currentStringAsTopic.caps]) {
      redundantLocalReferences.push([
        subtopicParents[currentTopic.caps][currentStringAsTopic.caps],
        currentSubtopic.caps,
        currentTopic.caps,
        currentStringAsTopic.caps
      ]);
    }

    subtopicParents[currentTopic.caps][currentStringAsTopic.caps] = currentSubtopic.caps;

    if (currentSubtopic.caps !== currentStringAsTopic.caps && currentTopic.caps !== currentStringAsTopic.caps) {
      return [new LocalReferenceToken(
        topicSubtopics[currentTopic.caps][currentTopic.caps].mixedCase,
        topicSubtopics[currentTopic.caps][currentStringAsTopic.caps].mixedCase,
        topicSubtopics[currentTopic.caps][currentTopic.caps].mixedCase,
        topicSubtopics[currentTopic.caps][currentSubtopic.caps].mixedCase,
        linkText
      ), fullText.length];
    } else {
      return null;
    }
  }
}

function globalReferenceMatcher(string, parsingContext) {
  let { topicSubtopics, currentTopic, currentSubtopic } = parsingContext;
  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  if (linkFragment) return;
  let stringAsTopic = new TopicName(linkTarget);

  if (topicSubtopics.hasOwnProperty(stringAsTopic.caps)) {
    return [new GlobalReferenceToken(
      topicSubtopics[stringAsTopic.caps][stringAsTopic.caps].mixedCase,
      topicSubtopics[stringAsTopic.caps][stringAsTopic.caps].mixedCase,
      topicSubtopics[currentTopic.caps][currentTopic.caps].mixedCase,
      topicSubtopics[currentTopic.caps][currentSubtopic.caps].mixedCase,
      linkText
    ), fullText.length];
  } else {
    return null;
  }
}

function importReferenceMatcher(string, parsingContext) {
  let {
    topicSubtopics,
    currentTopic,
    currentSubtopic,
    topicReferences,
    importReferencesToCheck
  } = parsingContext;

  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  let { targetTopic, targetSubtopic } = determineTopicAndSubtopic(linkTarget, linkFragment);

  if (!targetTopic) {
    topicReferences.map(topicName => new TopicName(topicName).caps).forEach(topicName => {
      if ((topicSubtopics[topicName]||{}).hasOwnProperty(targetSubtopic.caps)) {
        if (targetTopic) {
          console.error(`Error: Import reference ${fullText} in [${currentTopic.caps}, ${currentSubtopic.caps}] omits topic with multiple matching topic references.`)
          console.error(`Try using the explicit import reference syntax, eg [[Topic#Subtopic]]`);
          // process.exit();
        }
        targetTopic = new TopicName(topicName);
      }
    });

    if (!targetTopic) {
      console.error(`Error: Reference ${fullText} in [${currentTopic.caps}, ${currentSubtopic.caps}] matches no global, local, or import reference.`)
      // process.exit();
    }
  }

  importReferencesToCheck.push([currentTopic.caps, currentSubtopic.caps, targetTopic.caps, targetSubtopic.caps]);

  return [new ImportReferenceToken(
    topicSubtopics[targetTopic.caps][targetTopic.caps].mixedCase,
    topicSubtopics[targetTopic.caps][targetSubtopic.caps].mixedCase,
    topicSubtopics[currentTopic.caps][currentTopic.caps].mixedCase,
    topicSubtopics[currentTopic.caps][currentSubtopic.caps].mixedCase,
    linkText
  ), fullText.length];
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
  let targetTopic, targetSubtopic;
  if (linkFragment) {
    targetTopic = new TopicName(linkTarget);
    targetSubtopic = new TopicName(linkFragment);
  } else {
    targetTopic = null;
    targetSubtopic = new TopicName(linkTarget);
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

function hyperlinkMatcher(string, parsingContext) {
  let match = string.match(/^\[([^!\s\]]+)\](?:\(([^)]*)\))/);

  if (match) {
    return [
      new UrlToken(match[1], match[2]),
      match[0].length
    ]
  }
}

function urlMatcher(string, parsingContext) {
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
