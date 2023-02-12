let parseParagraph = require('./parse_paragraph');

function ParserContextMock(priorContext) {
  let context = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'},
    incrementLineNumber: jest.fn(),
    incrementCharacterNumber: jest.fn()
  }

  priorContext && Object.assign(context, priorContext);
  context.clone = jest.fn(() => ParserContextMock(context));

  return context;
}

test('it creates urls', () => {
  let text = 'This is a clause with [a link](http://google.com).';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].tokens).toEqual([{ type: 'text', text: 'a link'}]);
  expect(result[1].url).toEqual('http://google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('markdown urls with empty parens use url as link', () => {
  let text = 'This is a clause with [google.com]().';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with ');

  expect(result[1].type).toEqual('url');
  expect(result[1].tokens).toEqual([{ type: 'text', text: 'google.com' }]);
  expect(result[1].url).toEqual('google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test("it doesn't treat square brackets specially", () => {
  let text = 'These [brackets] do not imply a hyperlink.';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('These [brackets] do not imply a hyperlink.');
});

test('it creates markdown automatic urls', () => {
  let text = 'This is a clause with a link to http://google.com.';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is a clause with a link to ');

  expect(result[1].type).toEqual('url');
  expect(result[1].tokens).toEqual([{ type: 'text', text: 'http://google.com' }]);
  expect(result[1].url).toEqual('http://google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates markdown images without captions', () => {
  let text = 'This is an ![image](example.com/image "Title").';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is an ');

  expect(result[1].type).toEqual('image');
  expect(result[1].title).toEqual('Title');
  expect(result[1].caption).toEqual(undefined);
  expect(result[1].resourceUrl).toEqual('example.com/image');
  expect(result[1].anchorUrl).toEqual(null);

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates markdown images with captions', () => {
  let text = 'This is an ![image](example.com/image "Title" "Caption").';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is an ');

  expect(result[1].type).toEqual('image');
  expect(result[1].title).toEqual('Title');
  expect(result[1].caption).toEqual('Caption');
  expect(result[1].resourceUrl).toEqual('example.com/image');
  expect(result[1].anchorUrl).toEqual(null);

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates markdown images with titles that escape quotes and captions', () => {
  let text = 'This is an ![image](example.com/image "Title\\" \\"" "Caption").';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is an ');

  expect(result[1].type).toEqual('image');
  expect(result[1].title).toEqual('Title" "');
  expect(result[1].caption).toEqual('Caption');
  expect(result[1].resourceUrl).toEqual('example.com/image');
  expect(result[1].anchorUrl).toEqual(null);

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it creates linked markdown images without captions', () => {
  let text = 'This is an [![image](example.com/image "Title")](google.com).';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
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

test('it creates linked markdown images with captions', () => {
  let text = 'This is an [![image](example.com/image "Title" "Caption")](google.com).';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is an ');

  expect(result[1].type).toEqual('image');
  expect(result[1].title).toEqual('Title');
  expect(result[1].caption).toEqual('Caption');
  expect(result[1].resourceUrl).toEqual('example.com/image');
  expect(result[1].anchorUrl).toEqual('google.com');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it parses raw html', () => {
  let text = 'This is <b> raw html </b>.';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
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

test('it parses bold markup', () => {
  let text = 'This is *bold text*.';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is ');

  expect(result[1].type).toEqual('bold');
  expect(result[1].tokens[0].text).toEqual('bold text');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it parses italics markup', () => {
  let text = 'This is _italic text_.';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is ');

  expect(result[1].type).toEqual('italics');
  expect(result[1].tokens[0].text).toEqual('italic text');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it parses strikethrough markup', () => {
  let text = 'This is ~struckthrough text~.';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is ');

  expect(result[1].type).toEqual('strikethrough');
  expect(result[1].tokens[0].text).toEqual('struckthrough text');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});

test('it parses inline code snippets', () => {
  let text = 'This is `an inline code snippet`.';

  let parserContext = ParserContextMock();

  let result = parseParagraph(
    text,
    parserContext
  );

  expect(result[0].type).toEqual('text');
  expect(result[0].text).toEqual('This is ');

  expect(result[1].type).toEqual('inline_code');
  expect(result[1].text).toEqual('an inline code snippet');

  expect(result[2].type).toEqual('text');
  expect(result[2].text).toEqual('.');
});


