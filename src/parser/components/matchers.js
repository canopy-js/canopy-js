import {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken,
  markdownItalicMarkerToken,
  markdownBoldMarkerToken,
  markdownCodeMarkerToken,
  markdownUrlToken,
  markdownImageToken,
  markdownFootnoteToken,
  markdownHtmlToken
} from 'components/tokens';
import unitsOf from 'helpers/units_of';

const ReferenceMatchers = [
  localReferenceMatcher,
  globalReferenceMatcher,
  importReferenceMatcher,
];

const MarkdownMatchers = [
  escapedCharacterMatcher,
  markdownFootnoteMatcher,
  markdownImageMatcher,
  markdownHyperlinkMatcher,
  markdownUrlMatcher,
  markdownLinkedImageMatcher,
  markdownHtmlMatcher
];

const BaseMatchers = [
  textMatcher
]

function localReferenceMatcher(prefixObject, parsingContext) {
  let { topicSubtopics, currentTopic, currentSubtopic, localReferenceGraph } = parsingContext;

  if (
    topicSubtopics[currentTopic].
      hasOwnProperty(prefixObject.substringAsKey) &&
    currentSubtopic !== prefixObject.substringAsKey &&
    currentTopic !== prefixObject.substringAsKey
  ){
    localReferenceGraph[currentSubtopic] = localReferenceGraph[currentSubtopic] || [];
    localReferenceGraph[currentSubtopic].push(prefixObject.substringAsKey);

    return new LocalReferenceToken(
      currentTopic,
      prefixObject.substringAsKey,
      currentTopic,
      currentSubtopic,
      prefixObject.substring,
    );
  }
}

function globalReferenceMatcher(prefixObject, parsingContext, parseAllTokens) {
  let { topicSubtopics, currentTopic, currentSubtopic, avaliableNamespaces } = parsingContext;

  if (
    topicSubtopics.hasOwnProperty(prefixObject.substringAsKey) &&
    currentTopic !== prefixObject.substringAsKey
  ) {

    if (!avaliableNamespaces.includes(prefixObject.substringAsKey)) {
      parseAllTokens({
        ...parsingContext,
        avaliableNamespaces: avaliableNamespaces.slice().concat([prefixObject.substringAsKey])
      });
    }

    return new GlobalReferenceToken(
      prefixObject.substringAsKey,
      prefixObject.substringAsKey,
      currentTopic,
      currentSubtopic,
      prefixObject.substring,
    );
  }
}

function importReferenceMatcher(prefixObject, parsingContext) {
  let {
    topicSubtopics,
    currentTopic,
    currentSubtopic,
    avaliableNamespaces
  } = parsingContext;

  for (let i = 0; i < avaliableNamespaces.length; i++) {
    let namespaceNameAsKey = avaliableNamespaces[i];
    if (topicSubtopics[namespaceNameAsKey].hasOwnProperty(prefixObject.substringAsKey)){
      return new GlobalReferenceToken(
        namespaceNameAsKey,
        prefixObject.substringAsKey,
        currentTopic,
        currentSubtopic,
        prefixObject.substring,
      );
    }
  }
}

function escapedCharacterMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^(\\.)$/);
  if (match) {
    return new TextToken(match[1]);
  }
}

function markdownFootnoteMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^\[\^([^\]]+)\]$/);
  if (match) {
    return new markdownFootnoteToken(
      match[1]
    )
  }
}

function markdownHyperlinkMatcher(prefixObject, parsingContext) {
  let match = prefixObject.substring.match(/^\[([^\s\]]+)\](?:\(([^)]*)\))$/);
  if (match) {
    return new markdownUrlToken(
      match[1],
      match[2],
      parsingContext.currentSubtopic
    )
  }
}

function markdownUrlMatcher(prefixObject, parsingContext) {
  let match = prefixObject.substring.match(/^(\S+:\/\/\S+[^.\s])$/);
  if (match) {
    return new markdownUrlToken(
      match[1],
      match[1],
      parsingContext.currentSubtopic
    )
  }
}

function markdownImageMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^!\[([^\]]*)]\(([^\s]+)\s*(?:["']([^)]*)["'])?\)$/);
  if (match) {
    return new markdownImageToken(
      match[1],
      match[2],
      match[3]
    )
  }
}

function markdownLinkedImageMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^\[!\[([^\]]*)]\(([^\s]+)\s*"([^)]*)"\)\]\(([^)]*)\)$/);
  if (match) {
    return new markdownImageToken(
      match[1],
      match[2],
      match[3],
      match[4]
    )
  }
}

function markdownHtmlMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^<([^>]+)>[\s\S]*<\/([^>]+)>$/);
  if (match && match[1] === match[2]) {
    return new markdownHtmlToken(
      prefixObject.substring,
    )
  }
}

function textMatcher(prefixObject) {
  if (prefixObject.units.length !== 1) {
   return null;
  } else {
   return new TextToken(prefixObject.substring);
  }
}

export {
  ReferenceMatchers,
  MarkdownMatchers,
  BaseMatchers
};
