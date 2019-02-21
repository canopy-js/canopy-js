import blocksOfParagraph from './blocks_of_paragraph';

test('splits lines into blocks', () => {
  let data =
   `Line of text.
    Line of text.
    > Quote
    > Quote
    Line of text.
    # Code
    # Code
    Line of text.
    1. Outline
      a. Outline
      b. Outline
    2. Outline
      a. Outline
    Ordinary line of Text`;

  let result = blocksOfParagraph(data);

  expect(result.length).toEqual(7);

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

  expect(result[5].type).toEqual('outline');
  expect(result[5].lines.length).toEqual(5);

  expect(result[4].type).toEqual('text');
  expect(result[4].lines.length).toEqual(1);
});

test('splits lines into blocks', () => {
  let data =
   `Line of text.
    Line of text.`;

  let result = blocksOfParagraph(data);

  expect(result.length).toEqual(1);

  expect(result[0].type).toEqual('text');
  expect(result[0].lines.length).toEqual(2);
});
