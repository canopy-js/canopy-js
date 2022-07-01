let { linesByBlockOf } = require('./helpers');

test('splits lines into blocks', () => {
  let data =
   `Line of text.
    Line of text.
    > Quote
    > Quote
    Line of[^1] text.
    # Code
    # Code
    Line of [^2]text.
    [^1]: This is a footnote.
    [^2]: This is a second footnote.
    1. Outline
      a. Outline
      b. Outline
    2. Outline
      a. Outline
    Ordinary line of Text
    <html></html>`;

  let result = linesByBlockOf(data);

  expect(result.length).toEqual(9);

  expect(result[0].type).toEqual('text');
  expect(result[0].lines.length).toEqual(2);

  expect(result[1].type).toEqual('quote');
  expect(result[1].lines.length).toEqual(2);

  expect(result[2].type).toEqual('text');
  expect(result[2].lines.length).toEqual(1);

  expect(result[3].type).toEqual('code');
  expect(result[3].lines.length).toEqual(2);

  expect(result[4].type).toEqual('text');
  expect(result[4].lines.length).toEqual(1);

  expect(result[5].type).toEqual('list');
  expect(result[5].lines.length).toEqual(5);

  expect(result[6].type).toEqual('text');
  expect(result[6].lines.length).toEqual(1);

  expect(result[7].type).toEqual('html');
  expect(result[7].lines.length).toEqual(1);

  expect(result[8].type).toEqual('footnote');
  expect(result[8].lines.length).toEqual(2);
});

test('splits lines into blocks', () => {
  let data =
   `Line of text.
    Line of text.`;

  let result = linesByBlockOf(data);

  expect(result.length).toEqual(1);

  expect(result[0].type).toEqual('text');
  expect(result[0].lines.length).toEqual(2);
});
