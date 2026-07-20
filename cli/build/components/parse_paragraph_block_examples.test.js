let { TextToken } = require('./tokens');
import parseParagraph from './parse_paragraph';
let ParserContext = require('./parser_context')
let Topic = require('../../shared/topic');
let chalk = require('chalk');

function parserContextWithReferences() {
  let filePath = 'topics/ABC/ABC.expl';
  let parserContext = new ParserContext({
    explFileObjectsByPath: {
      [filePath]: { contents: 'ABC: Root.\n\nNext: Next.' }
    },
    defaultTopicString: 'ABC'
  });
  let topic = new Topic('ABC');

  parserContext.filePath = filePath;
  parserContext.setTopicAndSubtopic(topic, topic);

  return parserContext;
}

test('it parses a text block', () => {
  let text = 'This is a line.\n' +
    'This is also a line.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    { 
      "text": "This is a line.\nThis is also a line.",
      "type": "text",
    }
  ]);
});

test('it does not parse repeated asterisks as style delimiters', () => {
  let text = 'This stays literal: **bold** and ***.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      text: 'This stays literal: **bold** and ***.',
      type: 'text'
    }
  ]);
});

test('it does not parse repeated underscores as style delimiters', () => {
  let text = 'This stays literal: __italics__ and ___.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      text: 'This stays literal: __italics__ and ___.',
      type: 'text'
    }
  ]);
});

test('it does not parse style when the closing delimiter is part of a repeated run', () => {
  let text = 'The first thing that might jump out at us is the pattern of the word: _ו__ין.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      text: 'The first thing that might jump out at us is the pattern of the word: _ו__ין.',
      type: 'text'
    }
  ]);
});

test('it parses a fence-style code block', () => {
  let text = '```\n' +
    'if (x) {\n' +
    '  doSomething();\n' +
    '}\n' +
    '```';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      type: 'code_block',
      text: 'if (x) {\n  doSomething();\n}'
    }
  ]);
});

test('it parses a line-prefix style code block', () => {
  let text = '`\n' +
    '` if (x) {\n' +
    '`   doSomething();\n' +
    '` }\n' +
    '`\n';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      type: 'code_block',
      text: '\nif (x) {\n  doSomething();\n}\n'
    }
  ]);
});

test('it parses a LTR quote block', () => {
  let text = '> To be or not to be;\n' +
    '> that is the question.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      type: 'block_quote',
      direction: 'ltr',
      tokens: [
         {
           "text": "To be or not to be;\nthat is the question.",
           "type": "text",
         }
       ]
    }
  ]);
});

test('it parses a LTR quote block with multiline style', () => {
  let text = '> To be or not *to be;\n' +
    '> that is* the question.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      "type": "block_quote",
      "tokens": [
        {
          "text": "To be or not ",
          "type": "text"
        },
        {
          "type": "bold",
          "tokens": [
            {
              "text": "to be;\nthat is",
              "type": "text"
            }
          ]
        },
        {
          "text": " the question.",
          "type": "text"
        }
      ],
      "direction": "ltr"
    }
  ]);
});

test('it parses a RTL quote block', () => {
  let text = '< To be or not to be;\n' +
    '< that is the question.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      type: 'block_quote',
      direction: 'rtl',
      tokens: [
         {
           "text": "To be or not to be;\nthat is the question.",
           "type": "text",
         }
       ]
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

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens[0].type).toEqual('list');

  expect(tokens[0].topLevelNodes.length).toEqual(2);

  expect(tokens[0].topLevelNodes[0].ordinal).toEqual('1');
  expect(tokens[0].topLevelNodes[0].ordered).toEqual(true);
  expect(tokens[0].topLevelNodes[0].tokensOfLine[0].text).toEqual('This is the first line.');
  expect(tokens[0].topLevelNodes[0].children.length).toEqual(2);

  expect(tokens[0].topLevelNodes[0].children[0].ordinal).toEqual('a');
  expect(tokens[0].topLevelNodes[0].ordered).toEqual(true);
  expect(tokens[0].topLevelNodes[0].children[0].tokensOfLine[0].text).toEqual('This is an indentation.');
  expect(tokens[0].topLevelNodes[0].children[0].children.length).toEqual(1);

  expect(tokens[0].topLevelNodes[0].children[0].children[0].ordinal).toEqual('i');
  expect(tokens[0].topLevelNodes[0].ordered).toEqual(true);
  expect(tokens[0].topLevelNodes[0].children[0].children[0].tokensOfLine[0].text).toEqual('This is another bullet.');
  expect(tokens[0].topLevelNodes[0].children[0].children[0].children.length).toEqual(0);

  expect(tokens[0].topLevelNodes[0].children[1].ordinal).toEqual('b');
  expect(tokens[0].topLevelNodes[0].ordered).toEqual(true);
  expect(tokens[0].topLevelNodes[0].children[1].tokensOfLine[0].text).toEqual('This is another indentation.');
  expect(tokens[0].topLevelNodes[0].children[1].children.length).toEqual(0);

  expect(tokens[0].topLevelNodes[1].ordinal).toEqual('2');
  expect(tokens[0].topLevelNodes[1].ordered).toEqual(true);
  expect(tokens[0].topLevelNodes[1].tokensOfLine[0].text).toEqual('This is the second item.');
  expect(tokens[0].topLevelNodes[1].children.length).toEqual(1);

  expect(tokens[0].topLevelNodes[1].children[0].ordinal).toEqual('*');
  expect(tokens[0].topLevelNodes[1].children[0].ordered).toEqual(false);
  expect(tokens[0].topLevelNodes[1].children[0].tokensOfLine[0].text).toEqual('This is the last line.');
  expect(tokens[0].topLevelNodes[1].children[0].children.length).toEqual(0);
});

test('it does not parse lists for unsupported ordered prefixes', () => {
  let text = 'Y. This should not be a list.\n' +
    'X. Another line.';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens[0].type).toEqual('text');
  expect(tokens[0].text).toContain('Y. This should not be a list.');
});

test('it parses a table block', () => {
  let text = '| Header | Second column |\n' +
    '|======|=============|\n' +
    '| data \\|| data2 |';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens[0].type).toEqual('table');

  expect(tokens[0].rows[0][0].tokens[0].text).toEqual('Header');
  expect(tokens[0].rows[0][1].tokens[0].text).toEqual('Second column');
  expect(tokens[0].rows[1][0].tokens[0].text).toEqual('data |');
  expect(tokens[0].rows[1][1].tokens[0].text).toEqual('data2');
});

test('it parses table cell styles and classes and removes directives from cell text', () => {
  let text = '| Header | Second column |\n' +
    '|======|=============|\n' +
    '| data \\style="color: red" \\.warning-cell | \\.highlight \\style="background-color: blue" data2 \\.wide-cell \\style="font-weight: bold" |';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens[0].type).toEqual('table');

  expect(tokens[0].rows[1][0].style).toEqual('color: red');
  expect(tokens[0].rows[1][0].classNames).toEqual(['warning-cell']);
  expect(tokens[0].rows[1][0].tokens[0].text).toEqual('data');

  expect(tokens[0].rows[1][1].style).toEqual('background-color: blue; font-weight: bold');
  expect(tokens[0].rows[1][1].classNames).toEqual(['highlight', 'wide-cell']);
  expect(tokens[0].rows[1][1].tokens[0].text).toEqual('data2');
});

test('it rejects invalid merge syntax that goes off table', () => {
  let text = '| Header | Second column |\n' +
    '| \\< | \\< |';

  expect(() => parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }))).toThrow(
    chalk.red(`Invalid merge instructions in table: ${text}`)
  )
});

test('it rejects invalid merge syntax that goes in different directions', () => {
  let text = '| Header | Second column |\n' +
    '| \\^ | \\< |';

  expect(() => parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }))).toThrow(
    chalk.red(`Invalid merge instructions in table: ${text}`)
  )
});

test('it parses a footnote block', () => {
  let text = '[^1]: This is the first footnote\n' +
    '[^2]: This is the second footnote';

  let tokens = parseParagraph(text, new ParserContext({ explFileObjectsByPath: {}, defaultTopicString: 'ABC' }));

  expect(tokens).toEqual([
    {
      "type": "footnote_lines",
      "lines": [
        {
          "superscript": "1",
          "tokens": [
            {
              "text": " This is the first footnote",
              "type": "text"
            }
          ]
        },
        {
          "superscript": "2",
          "tokens": [
            {
              "text": " This is the second footnote",
              "type": "text"
            }
          ]
        }
      ]
    }
  ]);
});

test('it parses a linked image before a Canopy reference', () => {
  let text = '[![Alt](image.jpg)](target.jpg)\n[[Next]]';

  let tokens = parseParagraph(text, parserContextWithReferences());

  expect(tokens.map(token => token.type)).toEqual(['external', 'text', 'local']);
  expect(tokens[0]).toMatchObject({
    type: 'external',
    url: 'target.jpg',
    tokens: [{
      type: 'image',
      resourceUrl: 'image.jpg',
      altText: 'Alt'
    }]
  });
});

test('it parses a linked image with a title and caption before a menu', () => {
  let text = '[![Alt](image.jpg "Title" "Caption")](target.jpg)\n' +
    '===\n' +
    '> [[^|Back]]\n' +
    '===';

  let tokens = parseParagraph(text, parserContextWithReferences());

  expect(tokens.map(token => token.type)).toEqual(['external', 'text', 'menu']);
  expect(tokens[0].tokens[0]).toMatchObject({
    type: 'image',
    resourceUrl: 'image.jpg',
    title: 'Title',
    caption: 'Caption',
    altText: 'Alt'
  });
});

test('it still parses a disabled reference', () => {
  let tokens = parseParagraph('[![New Jersey]]', parserContextWithReferences());

  expect(tokens).toMatchObject([{
    type: 'disabled_reference',
    text: 'New Jersey'
  }]);
});

test('it still parses an unlinked image', () => {
  let tokens = parseParagraph(
    '![Alt](image.jpg "Title" "Caption")',
    parserContextWithReferences()
  );

  expect(tokens).toMatchObject([{
    type: 'image',
    resourceUrl: 'image.jpg',
    title: 'Title',
    caption: 'Caption',
    altText: 'Alt'
  }]);
});
