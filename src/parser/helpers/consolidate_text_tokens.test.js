import consolidateTextTokens from 'helpers/consolidate_text_tokens';
import {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken
} from 'components/tokens';

test('it consolidates text tokens in a mixed array', () => {
  let tokenArray = [
    new GlobalReferenceToken(),
    new TextToken('Hello', ['Hello']),
    new TextToken(' ', [' ']),
    new TextToken('World', ['World']),
    new LocalReferenceToken(),
    new TextToken('!', ['!']),
  ];

  let result = consolidateTextTokens(tokenArray);

  expect(result.length).toBe(4);
  expect(result[1].text).toBe('Hello World');
  expect(result[3].text).toBe('!');
});

test('it consolidates text tokens in a text array', () => {
  let tokenArray = [
    new TextToken('Hello'),
    new TextToken(' ', [' ']),
    new TextToken('World'),
    new TextToken('!')
  ];

  let result = consolidateTextTokens(tokenArray);

  expect(result.length).toBe(1);
  expect(result[0].text).toBe('Hello World!');
});


test('it handles consecutive link tokens', () => {
  let tokenArray = [
    new TextToken('Hello'),
    new GlobalReferenceToken(),
    new GlobalReferenceToken(),
    new TextToken('World')
  ];

  let result = consolidateTextTokens(tokenArray);
  expect(result.length).toBe(4);
});
