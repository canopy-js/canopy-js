import {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken,
  markdownItalicMarkerToken,
  markdownBoldMarkerToken,
  markdownCodeMarkerToken,
  markdownUrlToken,
  markdownImageToken,
  markdownFootnoteToken
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
  markdownHyperlinkMatcher,
  markdownImageMatcher,
  textMatcher
];

const BaseMatchers = [
  textMatcher
]

function escapedCharacterMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^\\(.)$/);
  if (match) {
    return new TextToken(match[1], true);
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

function markdownHyperlinkMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^\[([^\]]+)\](?:\((.*)\))?$/);
  if (match) {
    return new markdownUrlToken(
      match[1],
      match[2] || match[1],
    )
  }
}

function markdownUrlMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^(\S+\b.*:\/\/.*\b\S+)$/);
  if (match) {
    return new markdownUrlToken(
      match[1],
      match[1]
    )
  }
}

function markdownImageMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^!\[([^\]]*)]\(([^\s]+)\s*([^)]*)\)$/);
  if (match) {
    return new markdownImageToken(
      match[1],
      match[2],
      match[3]
    )
  }
}

function markdownLinkedImageMatcher(prefixObject) {
  let match = prefixObject.substring.match(/^\[!\[([^\]]*)]\(([^\s]+)\s*([^)]*)\)\]\(([^)]*)\)$/);
  if (match) {
    return new markdownImageToken(
      match[1],
      match[2],
      match[3],
      match[4]
    )
  }
}

function localReferenceMatcher(prefixObject, parsingContext) {
  let {topicSubtopics, currentTopic, currentSubtopic} = parsingContext;

  if (
    topicSubtopics[currentTopic].
      hasOwnProperty(prefixObject.substringAsKey) &&
    currentSubtopic !== prefixObject.substringAsKey &&
    currentTopic !== prefixObject.substringAsKey
  ){
    return new LocalReferenceToken(
      currentTopic,
      prefixObject.substringAsKey,
      currentTopic,
      currentSubtopic,
      prefixObject.substring,
    );
  }
}

function globalReferenceMatcher(prefixObject, parsingContext) {
  let {topicSubtopics, currentTopic, currentSubtopic} = parsingContext;

  if (
    topicSubtopics.hasOwnProperty(prefixObject.substringAsKey) &&
    currentTopic !== prefixObject.substringAsKey
  ) {
    avaliableNamespaces.push(prefixObject.substringAsKey);

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
