let { TextToken } = require('./tokens');
import parseParagraph from './parse_paragraph';

test('it parses a text block', () => {
  let text = 'This is a line.\n' +
    'This is also a line.';

  let parserContext = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'},
    incrementLineNumber: jest.fn()
  }

  let result = parseParagraph(text, parserContext);

  expect(result).toEqual([
    {
      type: 'text',
      text: 'This is a line.'
    },
    {
      type: 'text',
      text: 'This is also a line.',
    }
  ]);
});

test('it parses a code block', () => {
  let text = '```\n' +
    'if (x) {\n' +
    '  doSomething();\n' +
    '}\n' +
    '```';

  let parserContext = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'},
    incrementLineNumber: jest.fn()
  }

  let result = parseParagraph(text, parserContext);

  expect(result).toEqual([
    {
      type: 'code_block',
      text: 'if (x) {\n  doSomething();\n}\n'
    }
  ]);
});

test('it parses a quote block', () => {
  let text = ' > To be or not to be;\n' +
    ' > that is the question.';

  let parserContext = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'},
    incrementLineNumber: jest.fn()
  }

  let result = parseParagraph(text, parserContext);

  expect(result).toEqual([
    {
      type: 'quote',
      text: 'To be or not to be;\nthat is the question.\n'
    }
  ]);
});

test('it parses a list block', () => {
  let text = '1. This is the first line.\n' +
    '  a. This is an indentation.\n' +
    '    i. This is another bullet.\n' +
    '  b. This is another indentation.\n' +
    '2. This is the second item.\n' +
    '  * This is the last line.';

  let parserContext = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'},
    incrementLineNumber: jest.fn()
  }

  let result = parseParagraph(text, parserContext);

  expect(result[0].type).toEqual('list');

  expect(result[0].topLevelNodes.length).toEqual(2);

  expect(result[0].topLevelNodes[0].ordinal).toEqual('1');
  expect(result[0].topLevelNodes[0].ordered).toEqual(true);
  expect(result[0].topLevelNodes[0].tokensOfLine[0].text).toEqual('This is the first line.');
  expect(result[0].topLevelNodes[0].children.length).toEqual(2);

  expect(result[0].topLevelNodes[0].children[0].ordinal).toEqual('a');
  expect(result[0].topLevelNodes[0].ordered).toEqual(true);
  expect(result[0].topLevelNodes[0].children[0].tokensOfLine[0].text).toEqual('This is an indentation.');
  expect(result[0].topLevelNodes[0].children[0].children.length).toEqual(1);

  expect(result[0].topLevelNodes[0].children[0].children[0].ordinal).toEqual('i');
  expect(result[0].topLevelNodes[0].ordered).toEqual(true);
  expect(result[0].topLevelNodes[0].children[0].children[0].tokensOfLine[0].text).toEqual('This is another bullet.');
  expect(result[0].topLevelNodes[0].children[0].children[0].children.length).toEqual(0);

  expect(result[0].topLevelNodes[0].children[1].ordinal).toEqual('b');
  expect(result[0].topLevelNodes[0].ordered).toEqual(true);
  expect(result[0].topLevelNodes[0].children[1].tokensOfLine[0].text).toEqual('This is another indentation.');
  expect(result[0].topLevelNodes[0].children[1].children.length).toEqual(0);

  expect(result[0].topLevelNodes[1].ordinal).toEqual('2');
  expect(result[0].topLevelNodes[1].ordered).toEqual(true);
  expect(result[0].topLevelNodes[1].tokensOfLine[0].text).toEqual('This is the second item.');
  expect(result[0].topLevelNodes[1].children.length).toEqual(1);

  expect(result[0].topLevelNodes[1].children[0].ordinal).toEqual('*');
  expect(result[0].topLevelNodes[1].children[0].ordered).toEqual(false);
  expect(result[0].topLevelNodes[1].children[0].tokensOfLine[0].text).toEqual('This is the last line.');
  expect(result[0].topLevelNodes[1].children[0].children.length).toEqual(0);
});

test('it parses a table block', () => {
  let text = '| Header | Second column |\n' +
    '|======|=============|\n' +
    '| data \\|| data2 |';

  let parserContext = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'},
    incrementLineNumber: jest.fn()
  };

  let result = parseParagraph(text, parserContext);

  expect(result[0].type).toEqual('table');

  expect(result[0].rows[0][0][0].text).toEqual(' Header ');
  expect(result[0].rows[0][1][0].text).toEqual(' Second column ');
  expect(result[0].rows[1][0][0].text).toEqual(' data |');
  expect(result[0].rows[1][1][0].text).toEqual(' data2 ');
});

test('it parses a footnote block', () => {
  let text = '[^1]: This is the first footnote\n' +
    '[^2]: This is the second footnote';

  let parserContext = {
    currentTopicAndSubtopic: { currentTopic: 'A', currentSubtopic: 'B'},
    incrementLineNumber: jest.fn()
  }

  let result = parseParagraph(text, parserContext);

  expect(result.length).toEqual(3);
  expect(result[0].type).toEqual('footnote_rule');
  expect(result[1].superscript).toEqual('1');
  expect(result[1].tokens[0].type).toEqual('text');
  expect(result[1].tokens[0].text).toEqual(' This is the first footnote');
  expect(result[2].superscript).toEqual('2');
  expect(result[2].tokens[0].type).toEqual('text');
  expect(result[2].tokens[0].text).toEqual(' This is the second footnote');
});
