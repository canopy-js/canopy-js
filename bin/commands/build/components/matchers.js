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

let { GlobalLinkNeedingAddingToNamespacesError, linkProximityCalculator } = require('./helpers');
let { TopicName } = require('../../shared');

function localReferenceMatcher(string, parsingContext, index) {
  let {
    topicSubtopics,
    currentTopic,
    currentSubtopic,
    subtopicParents,
    redundantLocalReferences,
    provisionalLocalReferences,
    tokens,
    text
  } = parsingContext;

  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return;
  if (linkFragment) return;
  let currentStringAsTopic = new TopicName(linkTarget);
  subtopicParents[currentTopic.caps] = subtopicParents[currentTopic.caps] || {};

  if (topicSubtopics[currentTopic.caps].hasOwnProperty(currentStringAsTopic.caps)) { // the reference could be to a subtopic of current topic
    if (subtopicParents[currentTopic.caps][currentStringAsTopic.caps]) { // that subtopic already has a parent
      if (localReferenceCouldBeImport(text, index, topicSubtopics)) {
        return null // allow text to be matched as import reference in importReferenceMatcher
      }
      if (priorLocalReferenceCouldBeImport(provisionalLocalReferences)) {
        convertPriorLocalToImport(provisionalLocalReferences);
      } else {
        redundantLocalReferences.push([
          subtopicParents[currentTopic.caps][currentStringAsTopic.caps],
          currentSubtopic,
          currentTopic,
          currentStringAsTopic
        ]);
      }
    }

    subtopicParents[currentTopic.caps][currentStringAsTopic.caps] = currentSubtopic.caps; // mark this subtopic as claimed
    provisionalLocalReferences[currentStringAsTopic.caps] = { // local references to convert to imports if found redundant
      tokens,
      text,
      tokenIndex: tokens.length + 1,
      index,
      currentTopic,
      currentSubtopic,
      linkText
    };

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

  function localReferenceCouldBeImport(text, index) {
    let calculator = new linkProximityCalculator(text);
    let linksByProximity = calculator.linksByProximity(index);
    if (linksByProximity.find(value => {
      let potentialTopic = new TopicName(value);
      return topicSubtopics[potentialTopic.caps]?.hasOwnProperty(currentStringAsTopic.caps)
    })) {
      return true;
    } else {
      return false;
    }
  }

  function priorLocalReferenceCouldBeImport(provisionalLocalReferences) {
    let { tokens, text, index } = provisionalLocalReferences[currentStringAsTopic.caps];
    return localReferenceCouldBeImport(text, index);
  }

  function convertPriorLocalToImport(provisionalLocalReferences) {
    let {
      tokens,
      tokenIndex,
      text,
      index,
      currentTopic,
      currentSubtopic,
      linkText
    } = provisionalLocalReferences[currentStringAsTopic.caps];

    let calculator = new linkProximityCalculator(text);
    let linksByProximity = calculator.linksByProximity(index);
    let potentialTopic = new TopicName(linksByProximity.find(value => {
      let topic = new TopicName(value);
      return topicSubtopics[topic.caps]?.hasOwnProperty(currentStringAsTopic.caps);
    }));

    let importReference = new ImportReferenceToken(
      topicSubtopics[potentialTopic.caps][potentialTopic.caps].mixedCase,
      topicSubtopics[potentialTopic.caps][currentStringAsTopic.caps].mixedCase,
      topicSubtopics[currentTopic.caps][currentTopic.caps].mixedCase,
      topicSubtopics[currentTopic.caps][currentSubtopic.caps].mixedCase,
      linkText
    )
    console.log(tokens)
    tokens.splice(tokenIndex, 1, importReference);
    console.log(tokens)
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

function importReferenceMatcher(string, parsingContext, index) {
  let {
    topicSubtopics,
    currentTopic,
    currentSubtopic,
    topicReferencesInText,
    importReferencesToCheck,
    text
  } = parsingContext;

  let { linkTarget, linkFragment, linkText, fullText } = parseLink(string);
  if (!linkTarget) return; // not a well-formed link

  let { targetTopic, targetSubtopic } = determineTopicAndSubtopic(linkTarget, linkFragment);

  if (!targetTopic) { // The user chose to just give the subtopic and imply the topic by proximity
    let calculator = new linkProximityCalculator(text);
    let linksByProximity = calculator.linksByProximity(index);

    targetTopic = linksByProximity.map(topicName => new TopicName(topicName)).find(topicName => {
      return topicSubtopics[topicName.caps]?.hasOwnProperty(targetSubtopic.caps);
    });
  }

  if (!targetTopic) {
    throw `Error: Reference ${fullText} in [${currentTopic.mixedCase}, ${currentSubtopic.mixedCase}] matches no global, local, or import reference.`;
  }

  if (!topicSubtopics.hasOwnProperty(targetTopic.caps)) {
    throw `Error: Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existant topic`;
  }

  if (topicSubtopics.hasOwnProperty(targetTopic.caps) && !topicSubtopics[targetTopic.caps].hasOwnProperty(targetSubtopic.caps)) {
    throw `Error: Reference ${fullText} in topic [${currentTopic.mixedCase}] refers to non-existant subtopic in ${targetTopic.mixedCase}`;
  }

  importReferencesToCheck.push([currentTopic, currentSubtopic, targetTopic, targetSubtopic]);

  return [
    new ImportReferenceToken(
      topicSubtopics[targetTopic.caps][targetTopic.caps].mixedCase,
      topicSubtopics[targetTopic.caps][targetSubtopic.caps].mixedCase,
      topicSubtopics[currentTopic.caps][currentTopic.caps].mixedCase,
      topicSubtopics[currentTopic.caps][currentSubtopic.caps].mixedCase,
      linkText
    ), fullText.length
  ];
}

function parseLink(string) {
  // Match [[a]] or [[a#b]] or [[a|b]] or [[a#b|c]]
  let match = string.match(/^\[\[([^|#\[\]]+)(?:#([^|#\[\]]+))?(?:\|([^|#\[\]]+))?\]\]/);

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
