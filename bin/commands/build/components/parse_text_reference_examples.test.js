let parseText = require('./parse_text');

test('it creates text tokens', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': { mixedCase: 'Idaho'},
      }
    },
    currentTopicCaps: 'Idaho',
    currentSubtopicCaps: 'THE STATE CAPITAL',
    subtopicParents: {},
    importReferencesToCheck: []
  }

  let text = 'This is a clause with no links.';

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(1);
  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with no links.');
});

test('it matches local references', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': { mixedCase: 'Idaho'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital'},
        'THE STATE FLOWER': { mixedCase: 'The state flower'}
      }
    },
    currentTopicCaps: 'IDAHO',
    currentSubtopicCaps: 'THE STATE CAPITAL',
    subtopicParents: { 'IDAHO': {} },
    importReferencesToCheck: []
  }

  let text = 'This is a clause about [[the state flower]].';

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(3);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause about ');

  expect(result[1].type).toEqual('local');
  expect(result[1].text).toEqual('the state flower');
  expect(result[1].targetTopic).toEqual('Idaho');
  expect(result[1].targetSubtopic).toEqual('The state flower');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it matches global references', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': { mixedCase: 'Idaho'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital'},
        'THE STATE FLOWER': { mixedCase: 'The state flower'}
      },
      'WYOMING': {
        'WYOMING': { mixedCase: 'Wyoming'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital}'}
      }
    },
    currentTopicCaps: 'IDAHO',
    currentSubtopicCaps: 'THE STATE CAPITAL',
    subtopicParents: {},
    importReferencesToCheck: []
  }

  let text = 'The state of Idaho borders [[Wyoming]].';

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(3);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('The state of Idaho borders ');

  expect(result[1].type).toEqual('global');
  expect(result[1].text).toEqual('Wyoming');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Wyoming');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it lets you give arbitrary names to references', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': { mixedCase: 'Idaho'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital'},
        'THE STATE FLOWER': { mixedCase: 'The state flower'}
      },
      'WYOMING': {
        'WYOMING': { mixedCase: 'Wyoming'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital}'}
      }
    },
    currentTopicCaps: 'IDAHO',
    currentSubtopicCaps: 'THE STATE CAPITAL',
    subtopicParents: {},
    importReferencesToCheck: []
  }

  let text = 'The state of Idaho borders [[Wyoming|Kentucky]].';

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(3);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('The state of Idaho borders ');

  expect(result[1].type).toEqual('global');
  expect(result[1].text).toEqual('Kentucky');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Wyoming');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it matches import references', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': { mixedCase: 'Idaho'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital'},
        'THE STATE FLOWER': { mixedCase: 'The state flower'}
      },
      'WYOMING': {
        'WYOMING': { mixedCase: 'Wyoming' },
        'YELLOWSTONE NATIONAL PARK': { mixedCase: 'Yellowstone National Park'},
      }
    },
    currentTopicCaps: 'IDAHO',
    currentSubtopicCaps: 'THE STATE CAPITAL',
    subtopicParents: {},
    importReferencesToCheck: []
  }

  let text = "Idaho's state capital is near [[Wyoming]] and its [[Yellowstone National Park]].";

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(5);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('Idaho\'s state capital is near ');

  expect(result[1].type).toEqual('global');
  expect(result[1].text).toEqual('Wyoming');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Wyoming');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual(' and its ');

  expect(result[3].type).toEqual('import');
  expect(result[3].text).toEqual('Yellowstone National Park');
  expect(result[3].targetTopic).toEqual('Wyoming');
  expect(result[3].targetSubtopic).toEqual('Yellowstone National Park');
  expect(result[3].enclosingTopic).toEqual('Idaho');
  expect(result[3].enclosingSubtopic).toEqual('The state capital');

  expect(result[4].type).toEqual('text');
  expect(result[4].text).toEqual('.');
});

test('it matches import references in any order within a sentence', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': {mixedCase: 'Idaho'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital'},
        'THE STATE FLOWER': { mixedCase: 'The state flower'}
      },
      'WYOMING': {
        'WYOMING': { mixedCase: 'Wyoming'},
        'YELLOWSTONE NATIONAL PARK': { mixedCase: 'Yellowstone National Park'}
      }
    },
    currentTopicCaps: 'IDAHO',
    currentSubtopicCaps: 'THE STATE CAPITAL',
    subtopicParents: {},
    importReferencesToCheck: []
  }

  let text = "Idaho's state capital is near [[Yellowstone National Park]], of [[Wyoming]].";

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(5);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual("Idaho's state capital is near ");

  expect(result[1].type).toEqual('import');
  expect(result[1].text).toEqual('Yellowstone National Park');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Yellowstone National Park');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual(', of ');

  expect(result[3].type).toEqual('global');
  expect(result[3].text).toEqual('Wyoming');
  expect(result[3].targetTopic).toEqual('Wyoming');
  expect(result[3].targetSubtopic).toEqual('Wyoming');
  expect(result[3].enclosingTopic).toEqual('Idaho');
  expect(result[3].enclosingSubtopic).toEqual('The state capital');

  expect(result[4].type).toEqual('text');
  expect(result[4].text).toEqual('.');
});

test('it matches import references with explicit syntax and lets you rename the link', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': {mixedCase: 'Idaho'},
        'THE STATE CAPITAL': { mixedCase: 'The state capital'},
        'THE STATE FLOWER': { mixedCase: 'The state flower'}
      },
      'WYOMING': {
        'WYOMING': { mixedCase: 'Wyoming'},
        'YELLOWSTONE NATIONAL PARK': { mixedCase: 'Yellowstone National Park'}
      }
    },
    currentTopicCaps: 'IDAHO',
    currentSubtopicCaps: 'THE STATE CAPITAL',
    subtopicParents: {},
    importReferencesToCheck: []
  }

  let text = "Idaho's state capital is near [[Wyoming#Yellowstone National Park|the park]], of [[Wyoming]].";

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(5);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual("Idaho's state capital is near ");

  expect(result[1].type).toEqual('import');
  expect(result[1].text).toEqual('the park');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Yellowstone National Park');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual(', of ');

  expect(result[3].type).toEqual('global');
  expect(result[3].text).toEqual('Wyoming');
  expect(result[3].targetTopic).toEqual('Wyoming');
  expect(result[3].targetSubtopic).toEqual('Wyoming');
  expect(result[3].enclosingTopic).toEqual('Idaho');
  expect(result[3].enclosingSubtopic).toEqual('The state capital');

  expect(result[4].type).toEqual('text');
  expect(result[4].text).toEqual('.');
});

