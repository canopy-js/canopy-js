import parseClause from './parse_clause';

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

  let clauseWithPunctuation = 'This is a clause with no links.'

  let result = parseClause(
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

  let clauseWithPunctuation = 'This is a clause about the state flower.'

  let result = parseClause(
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

  let clauseWithPunctuation = 'The state of Idaho borders Wyoming.'

  let result = parseClause(
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

  let clauseWithPunctuation = "Idaho's state capital is near Wyoming and its Yellowstone National Park."

  let result = parseClause(
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

test('it matches import references in any order within a clause', () => {
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

  let clauseWithPunctuation = "Idaho's state capital is near Yellowstone National Park of Wyoming."

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result.length).toEqual(5);

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('Idaho\'s state capital is near ');

  expect(result[1].type).toEqual('global');
  expect(result[1].text).toEqual('Yellowstone National Park');
  expect(result[1].targetTopic).toEqual('Wyoming');
  expect(result[1].targetSubtopic).toEqual('Yellowstone National Park');
  expect(result[1].enclosingTopic).toEqual('Idaho');
  expect(result[1].enclosingSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual(' of ');

  expect(result[3].type).toEqual('global');
  expect(result[3].text).toEqual('Wyoming');
  expect(result[3].targetTopic).toEqual('Wyoming');
  expect(result[3].targetSubtopic).toEqual('Wyoming');
  expect(result[3].enclosingTopic).toEqual('Idaho');
  expect(result[3].enclosingSubtopic).toEqual('The state capital');

  expect(result[4].type).toEqual('text');
  expect(result[4].text).toEqual('.');
});

test('it creates markdown urls', () => {
  let parsingContext = {
    markdownOnly: true,
    currentSubtopic: 'The state capital'
  }

  let clauseWithPunctuation = 'This is a clause with [google.com](a markdown link).'

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('a markdown link');
  expect(result[1].url).toEqual('google.com');
  expect(result[1].urlSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('markdown urls with empty parens use url as link', () => {
  let parsingContext = {
    markdownOnly: true,
    currentSubtopic: 'The state capital'
  }

  let clauseWithPunctuation = 'This is a clause with [google.com]().'

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('google.com');
  expect(result[1].url).toEqual('google.com');
  expect(result[1].urlSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test("it doesn't treat square brackets specially", () => {
  let parsingContext = {
    markdownOnly: true
  }

  let clauseWithPunctuation = 'These [brackets] do not imply a hyperlink.'

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('These [brackets] do not imply a hyperlink.');
});

test('it creates markdown automatic urls', () => {
  let parsingContext = {
    markdownOnly: true,
    currentSubtopic: 'The state capital'
  }

  let clauseWithPunctuation = 'This is a clause with a link to http://google.com.'

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with a link to ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('http://google.com');
  expect(result[1].url).toEqual('http://google.com');
  expect(result[1].urlSubtopic).toEqual('The state capital');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates markdown images', () => {
  let parsingContext = {
    markdownOnly: true
  }

  let clauseWithPunctuation = 'This is an ![image](example.com/image "Title").';

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is an ');

  expect(result[1].type).toEqual('image');
  expect(result[1].title).toEqual('Title');
  expect(result[1].resourceUrl).toEqual('example.com/image');
  expect(result[1].anchorUrl).toEqual(null);

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates linked markdown images', () => {
  let parsingContext = {
    markdownOnly: true
  }

  let clauseWithPunctuation = 'This is an [![image](example.com/image "Title")](google.com).';

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is an ');

  expect(result[1].type).toEqual('image');
  expect(result[1].title).toEqual('Title');
  expect(result[1].resourceUrl).toEqual('example.com/image');
  expect(result[1].anchorUrl).toEqual('google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it parses raw html', () => {
  let parsingContext = {
    markdownOnly: true
  }

  let clauseWithPunctuation = 'This is <b> raw html </b>.';

  let result = parseClause(
    clauseWithPunctuation,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is ');

  expect(result[1].type).toEqual('html');
  expect(result[1].html).toEqual('<b> raw html </b>');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});


