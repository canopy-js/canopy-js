let parseText = require('./parse_text');

test('it creates urls', () => {
  let text = 'This is a clause with [google.com](a link).'

  let result = parseText(
    text,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('a link');
  expect(result[1].url).toEqual('google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('urls with empty parens use url as link', () => {
  let text = 'This is a clause with [google.com]().'

  let result = parseText(
    text,
    {}
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('google.com');
  expect(result[1].url).toEqual('google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test("it doesn't treat square brackets specially", () => {
  let parsingContext = {};

  let text = 'These [brackets] do not imply a hyperlink.';

  let result = parseText(
    text,
    parsingContext
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('These [brackets] do not imply a hyperlink.');
});

test('it creates automatic urls', () => {
  let text = 'This is a clause with a link to http://google.com.';

  let result = parseText(
    text,
    {}
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with a link to ');

  expect(result[1].type).toEqual('url');
  expect(result[1].text).toEqual('http://google.com');
  expect(result[1].url).toEqual('http://google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates images', () => {
  let text = 'This is an ![image](example.com/image "Title").';

  let result = parseText(
    text,
    {}
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

test('it creates linked images', () => {
  let text = 'This is an [![image](example.com/image "Title")](google.com).';

  let result = parseText(
    text,
    {}
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
  let parsingContext = {};

  let text = 'This is <b> raw html </b>.';

  let result = parseText(
    text,
    {}
  )

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is ');

  expect(result[1].type).toEqual('html');
  expect(result[1].html).toEqual('<b> raw html </b>');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});


