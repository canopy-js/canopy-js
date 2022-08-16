let parseText = require('./parse_text');

test('it creates urls', () => {
  let text = 'This is a clause with [google.com](a link).';

  let parserContext = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'}
  };

  let result = parseText(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('a link');
  expect(result[1].url).toEqual('google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('markdown urls with empty parens use url as link', () => {
  let text = 'This is a clause with [google.com]().';

  let parserContext = { currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'} };

  let result = parseText(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('google.com');
  expect(result[1].url).toEqual('google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test("it doesn't treat square brackets specially", () => {
  let text = 'These [brackets] do not imply a hyperlink.';

  let parserContext = { currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'} };

  let result = parseText(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('These [brackets] do not imply a hyperlink.');
});

test('it creates markdown automatic urls', () => {
  let text = 'This is a clause with a link to http://google.com.';

  let parserContext = { currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'} };

  let result = parseText(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with a link to ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('http://google.com');
  expect(result[1].url).toEqual('http://google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates markdown images', () => {
  let text = 'This is an ![image](example.com/image "Title").';

  let parserContext = { currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'} };

  let result = parseText(
    text,
    parserContext
  );

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
  let text = 'This is an [![image](example.com/image "Title")](google.com).';

  let parserContext = { currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'} };

  let result = parseText(
    text,
    parserContext
  );

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
  let text = 'This is <b> raw html </b>.';

  let parserContext = { currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'} };

  let result = parseText(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is ');

  expect(result[1].type).toEqual('html_element');
  expect(result[1].html).toEqual('<b> raw html </b>');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});


