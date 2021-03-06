import parseSentence from './parse_sentence';

test('it creates text tokens', () => {
  let parsingContext = {
    topicSubtopics: {
      'Idaho': {
        'Idaho': true,
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: [],
    markdownOnly: false
  }

  let clauseWithPunctuation = 'This is a clause with no links.';

  let result = parseSentence(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result.length).toEqual(1);
  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with no links.');
});

test('it matches local references', () => {
  let parsingContext = {
    topicSubtopics: {
      'Idaho': {
        'Idaho': true,
        'The state capital': true,
        'The state flower': true
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: [],
    markdownOnly: false
  }

  let clauseWithPunctuation = 'This is a clause about the state flower.';

  let result = parseSentence(
    clauseWithPunctuation,
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
      'Idaho': {
        'Idaho': true,
        'The state capital': true,
        'The state flower': true
      },
      'Wyoming': {
        'Wyoming': true,
        'The state capital': true
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: [],
    markdownOnly: false
  }

  let clauseWithPunctuation = 'The state of Idaho borders Wyoming.';

  let result = parseSentence(
    clauseWithPunctuation,
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

test('it matches import references', () => {
  let parsingContext = {
    topicSubtopics: {
      'Idaho': {
        'The state capital': true,
        'The state flower': true
      },
      'Wyoming': {
        'Yellowstone National Park': true
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: [],
    markdownOnly: false
  }

  let clauseWithPunctuation = "Idaho's state capital is near Wyoming and its Yellowstone National Park.";

  let result = parseSentence(
    clauseWithPunctuation,
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

  expect(result[3].type).toEqual('global');
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
      'Idaho': {
        'The state capital': true,
        'The state flower': true
      },
      'Wyoming': {
        'Yellowstone National Park': true
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: [],
    markdownOnly: false
  }

  let clauseWithPunctuation = "Idaho's state capital is near Yellowstone National Park, of Wyoming.";

  let result = parseSentence(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result.length).toEqual(5);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual("Idaho's state capital is near ");

  expect(result[1].type).toEqual('global');
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

test('it ignores markdown tokens in match finding', () => {
  let parsingContext = {
    topicSubtopics: {
      'Idaho': {
        'Idaho': true,
        'The state capital': true,
        'The state flower': true
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: [],
    markdownOnly: false
  }

  let clauseWithPunctuation = 'This is a clause about the _state_ *flower*.';

  let result = parseSentence(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result.length).toEqual(3);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause about ');

  expect(result[1].type).toEqual('local');
  expect(result[1].text).toEqual('the _state_ *flower*');
  expect(result[1].targetTopic).toEqual('Idaho');
  expect(result[1].targetSubtopic).toEqual('The state flower');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('A global link cannot cause recognition of an earlier import reference that then uses tokens that were part of the global link', () => {
  let parsingContext = {
    topicSubtopics: {
      'Idaho': {
        'The state capital': true,
        'The state flower': true
      },
      'Wyoming': {
        'A subtopic ending in Wyoming': true
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: [],
    markdownOnly: false
  }

  let clauseWithPunctuation = "There is a subtopic ending in Wyoming.";

  let result = parseSentence(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result.length).toEqual(3);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('There is a subtopic ending in ');

  expect(result[1].type).toEqual('global');
  expect(result[1].text).toEqual('Wyoming');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Wyoming');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it does not matche import references whose topics were in earlier clauses', () => {
  let parsingContext = {
    topicSubtopics: {
      'Idaho': {
        'The state capital': true,
        'The state flower': true
      },
      'Wyoming': {
        'Yellowstone National Park': true
      }
    },
    currentTopic: 'Idaho',
    currentSubtopic: 'The state capital',
    avaliableNamespaces: ['Wyoming'],
    markdownOnly: false
  }

  let clauseWithPunctuation = "I like Yellowstone National Park.";

  let result = parseSentence(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result.length).toEqual(1);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual("I like Yellowstone National Park.");
});
