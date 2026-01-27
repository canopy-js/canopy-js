let ParserContext = require('./parser_context');
let Topic = require('../../shared/topic');

test('it errors on duplicate fragment references in a topic', () => {
  expect.assertions(2);
  let parserContext = new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'Root' });
  parserContext.filePath = 'topics/Foo/Bar.expl';
  parserContext.setTopicAndSubtopic(Topic.for('Foo'), Topic.for('Foo'));

  const reference = { targetAsTopic: Topic.for('Frag') };

  parserContext.lineNumber = 3;
  parserContext.characterNumber = 5;
  parserContext.registerFragmentReference(reference, parserContext.currentSubtopic);

  parserContext.lineNumber = 10;
  parserContext.characterNumber = 2;

  try {
    parserContext.registerFragmentReference(reference, parserContext.currentSubtopic);
  } catch (error) {
    expect(String(error)).toMatch(/topics\/Foo\/Bar\.expl:3:5/);
    expect(String(error)).toMatch(/topics\/Foo\/Bar\.expl:10:2/);
  }
});
