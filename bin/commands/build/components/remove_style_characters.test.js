let { removeStyleCharacters } = require('./helpers');

test('it handles style characters at the front of the string', () => {
  let text = '*a*'
  expect(removeStyleCharacters(text)).toEqual('a');
});

test('it handles style characters after the start of the string', () => {
  let text = ' *a*'
  expect(removeStyleCharacters(text)).toEqual(' a');
});

test('it handles style characters before the end of the string', () => {
  let text = '*a* '
  expect(removeStyleCharacters(text)).toEqual('a ');
});

test('it handles nested style characters', () => {
  let text = '_*a*_'
  expect(removeStyleCharacters(text)).toEqual('a');
});

test('it handles multiple groups of style characters', () => {
  let text = '_*a*_ *b*'
  expect(removeStyleCharacters(text)).toEqual('a b');
});
