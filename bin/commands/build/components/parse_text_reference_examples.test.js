let parseText = require('./parse_text');
let { TopicName } = require('../../shared');

test('it creates text tokens', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': new TopicName('Idaho'),
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
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
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: { 'IDAHO': {} },
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
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
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      },
      'WYOMING': {
        'WYOMING': new TopicName('Wyoming'),
        'THE STATE CAPITAL': new TopicName('The state capital')
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
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
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      },
      'WYOMING': {
        'WYOMING': new TopicName('Wyoming'),
        'THE STATE CAPITAL': new TopicName('The state capital')
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
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

test('it matches implicit import references', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      },
      'WYOMING': {
        'WYOMING': new TopicName('Wyoming'),
        'YELLOWSTONE NATIONAL PARK': new TopicName('Yellowstone National Park'),
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
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

test('it matches implicit import references in any order within a sentence', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      },
      'WYOMING': {
        'WYOMING': new TopicName('Wyoming'),
        'YELLOWSTONE NATIONAL PARK': new TopicName('Yellowstone National Park')
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
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

test('it matches an implicit import reference to the closest candidate link', () => {
  let parsingContext = {
    topicSubtopics: {
      'MY VACATION': {
        'MY VACATION': new TopicName('My vacation'),
        'PLACES TO GO': new TopicName('Places to go')
      },
      'OHIO': {
        'OHIO': new TopicName('Ohio'),
        'COLUMBUS': new TopicName('Columbus'),
        'LONDON': new TopicName('London')
      },
      'ENGLAND': {
        'ENGLAND': new TopicName('England'),
        'LONDON': new TopicName('London')
      }
    },
    currentTopic: new TopicName('My vacation'),
    currentSubtopic: new TopicName('Places to go'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
  }

  let text = "I would like to visit [[Columbus]], [[Ohio]] and [[London]], [[England]]"; // There is also a London, Ohio

  let result = parseText(
    text,
    parsingContext
  )

  expect(result.length).toEqual(8);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual("I would like to visit ");

  expect(result[1].type).toEqual('import');
  expect(result[1].text).toEqual('Columbus');
  expect(result[1].targetTopic).toEqual('Ohio');
  expect(result[1].targetSubtopic).toEqual('Columbus');
  expect(result[1].enclosingTopic).toEqual('My vacation');
  expect(result[1].enclosingSubtopic).toEqual('Places to go');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual(', ');

  expect(result[3].type).toEqual('global');
  expect(result[3].text).toEqual('Ohio');
  expect(result[3].targetTopic).toEqual('Ohio');
  expect(result[3].targetSubtopic).toEqual('Ohio');
  expect(result[3].enclosingTopic).toEqual('My vacation');
  expect(result[3].enclosingSubtopic).toEqual('Places to go');

  expect(result[4].type).toEqual('text');
  expect(result[4].text).toEqual(' and ');

  expect(result[5].type).toEqual('import');
  expect(result[5].text).toEqual('London');
  expect(result[5].targetTopic).toEqual('England');
  expect(result[5].targetSubtopic).toEqual('London');
  expect(result[5].enclosingTopic).toEqual('My vacation');
  expect(result[5].enclosingSubtopic).toEqual('Places to go');

  expect(result[6].type).toEqual('text');
  expect(result[6].text).toEqual(', ');

  expect(result[7].type).toEqual('global');
  expect(result[7].text).toEqual('England');
  expect(result[7].targetTopic).toEqual('England');
  expect(result[7].targetSubtopic).toEqual('England');
  expect(result[7].enclosingTopic).toEqual('My vacation');
  expect(result[7].enclosingSubtopic).toEqual('Places to go');
});

test('it matches import references with explicit syntax and lets you rename the link', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      },
      'WYOMING': {
        'WYOMING': new TopicName('Wyoming'),
        'YELLOWSTONE NATIONAL PARK': new TopicName('Yellowstone National Park')
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
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

test('it matches back to back global references', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      },
      'WYOMING': {
        'WYOMING': new TopicName('Wyoming'),
        'THE STATE CAPITAL': new TopicName('The state capital')
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
  }

  let text = 'The state of Idaho borders [[Wyoming]][[Wyoming]]';

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

  expect(result[2].type).toEqual('global');
  expect(result[2].text).toEqual('Wyoming');
  expect(result[2].targetTopic).toEqual('Wyoming');
  expect(result[2].targetSubtopic).toEqual('Wyoming');
  expect(result[2].enclosingTopic).toEqual('Idaho');
  expect(result[2].enclosingSubtopic).toEqual('The state capital');
});

test('it matches global references at the end of strings', () => {
  let parsingContext = {
    topicSubtopics: {
      'IDAHO': {
        'IDAHO': new TopicName('Idaho'),
        'THE STATE CAPITAL': new TopicName('The state capital'),
        'THE STATE FLOWER': new TopicName('The state flower')
      },
      'WYOMING': {
        'WYOMING': new TopicName('Wyoming'),
        'THE STATE CAPITAL': new TopicName('The state capital')
      }
    },
    currentTopic: new TopicName('Idaho'),
    currentSubtopic: new TopicName('The State Capital'),
    subtopicParents: {},
    importReferencesToCheck: [],
    provisionalLocalReferences: {}
  }

  let text = 'The state of Idaho borders [[Wyoming]]';

  let result = parseText(
    text,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('The state of Idaho borders ');

  expect(result[1].type).toEqual('global');
  expect(result[1].text).toEqual('Wyoming');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Wyoming');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result.length).toEqual(2);
});
