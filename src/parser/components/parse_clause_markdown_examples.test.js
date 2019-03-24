import parseClause from './parse_clause';

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

  let clauseWithPunctuation = 'These [brackets] do not imply a hyperlink.';

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

  let clauseWithPunctuation = 'This is a clause with a link to http://google.com.';

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


