let { TextToken } = require('./tokens');
// jest.mock('./parse_text', () => ({
//   __esModule: true,
//   default: jest.fn((clauseString) => [{ type: 'text', text: clauseString }])
// }));

import {
  textBlockFor,
  codeBlockFor,
  quoteBlockFor,
  listBlockFor,
  tableBlockFor,
  footnoteBlockFor
} from './block_parsers';

test('it parses a text block', () => {
  let lines = [
    'This is a line.',
    'This is also a line.'
  ]

  let result = textBlockFor(lines, {});

  expect(result.type).toEqual('text');
  expect(result.tokensByLine.length).toEqual(2);
  expect(result.tokensByLine[0][0].text).toEqual('This is a line.');
  expect(result.tokensByLine[1][0].text).toEqual('This is also a line.');
});

test('it parses a code block', () => {
  let lines = [
    ' # if (x) { ',
    ' #   doSomething(); ',
    ' # }'
  ]

  let result = codeBlockFor(lines, {});

  expect(result.type).toEqual('code');
  expect(result.lines[0]).toEqual('if (x) { ');
  expect(result.lines[1]).toEqual('  doSomething(); ');
  expect(result.lines[2]).toEqual('}');
});

test('it parses a quote block', () => {
  let lines = [
    ' > To be or not to be;',
    ' > that is the question.'
  ]
  let result = quoteBlockFor(lines);

  expect(result.type).toEqual('quote');
  expect(result.tokensByLine[0][0].text).toEqual('To be or not to be;');
  expect(result.tokensByLine[1][0].text).toEqual('that is the question.');
});

test('it parses a list block', () => {
  let lines = [
    '1. This is the first line.',
    '  a. This is an indentation.',
    '    i. This is another bullet.',
    '  b. This is another indentation.',
    '2. This is the second item.',
    '  * This is the last line.'
  ]

  let result = listBlockFor(lines, {});

  expect(result.type).toEqual('list');

  expect(result.topLevelNodes.length).toEqual(2);

  expect(result.topLevelNodes[0].ordinal).toEqual('1');
  expect(result.topLevelNodes[0].ordered).toEqual(true);
  expect(result.topLevelNodes[0].tokensOfLine[0].text).toEqual('This is the first line.');
  expect(result.topLevelNodes[0].children.length).toEqual(2);

  expect(result.topLevelNodes[0].children[0].ordinal).toEqual('a');
  expect(result.topLevelNodes[0].ordered).toEqual(true);
  expect(result.topLevelNodes[0].children[0].tokensOfLine[0].text).toEqual('This is an indentation.');
  expect(result.topLevelNodes[0].children[0].children.length).toEqual(1);

  expect(result.topLevelNodes[0].children[0].children[0].ordinal).toEqual('i');
  expect(result.topLevelNodes[0].ordered).toEqual(true);
  expect(result.topLevelNodes[0].children[0].children[0].tokensOfLine[0].text).toEqual('This is another bullet.');
  expect(result.topLevelNodes[0].children[0].children[0].children.length).toEqual(0);

  expect(result.topLevelNodes[0].children[1].ordinal).toEqual('b');
  expect(result.topLevelNodes[0].ordered).toEqual(true);
  expect(result.topLevelNodes[0].children[1].tokensOfLine[0].text).toEqual('This is another indentation.');
  expect(result.topLevelNodes[0].children[1].children.length).toEqual(0);

  expect(result.topLevelNodes[1].ordinal).toEqual('2');
  expect(result.topLevelNodes[1].ordered).toEqual(true);
  expect(result.topLevelNodes[1].tokensOfLine[0].text).toEqual('This is the second item.');
  expect(result.topLevelNodes[1].children.length).toEqual(1);

  expect(result.topLevelNodes[1].children[0].ordinal).toEqual('*');
  expect(result.topLevelNodes[1].children[0].ordered).toEqual(false);
  expect(result.topLevelNodes[1].children[0].tokensOfLine[0].text).toEqual('This is the last line.');
  expect(result.topLevelNodes[1].children[0].children.length).toEqual(0);
});

test('it parses a table block', () => {
  let lines = [
    '| Header | Second column |',
    '| ====== | ============= |',
    '| data \\| | data2 |',
  ];
  let result = tableBlockFor(lines, {});

  expect(result.type).toEqual('table');

  expect(result.tokensByCellByRow[0][0][0].text).toEqual(' Header ');
  expect(result.tokensByCellByRow[0][1][0].text).toEqual(' Second column ');
  expect(result.tokensByCellByRow[1][0][0].text).toEqual(' data ');
  expect(result.tokensByCellByRow[1][0][1].text).toEqual('|');
  expect(result.tokensByCellByRow[1][1][0].text).toEqual(' data2 ');
});

test('it parses a footnote block', () => {
  let lines = [
    '[^1]: This is the first footnote',
    '[^2]: This is the second footnote'
  ];

  let result = footnoteBlockFor(lines, {});
  expect(result.type).toEqual('footnote');
  expect(result.footnoteObjects.length).toEqual(2);
  expect(result.footnoteObjects[0].superscript).toEqual('1');
  expect(result.footnoteObjects[0].tokens[0].type).toEqual('text');
  expect(result.footnoteObjects[0].tokens[0].text).toEqual(' This is the first footnote');
  expect(result.footnoteObjects[1].superscript).toEqual('2');
  expect(result.footnoteObjects[1].tokens[0].type).toEqual('text');
  expect(result.footnoteObjects[1].tokens[0].text).toEqual(' This is the second footnote');
});
