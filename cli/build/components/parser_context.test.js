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

test('it errors when a local reference matches an existing fragment reference', () => {
  let parserContext = new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'Root' });
  parserContext.filePath = 'topics/Foo/Bar.expl';
  parserContext.setTopicAndSubtopic(Topic.for('Foo'), Topic.for('Foo'));

  parserContext.registerFragmentReference({
    targetAsTopic: Topic.for('Frag'),
    fragmentText: '[#[Frag|frag]]'
  }, parserContext.currentSubtopic);

  expect(() => parserContext.registerLocalReference(Topic.for('Frag'), 0, { fullText: '[[Frag]]' }))
    .toThrow(/Local reference \[\[Frag]] conflicts with fragment reference \[#\[Frag\|frag]]/);
});
