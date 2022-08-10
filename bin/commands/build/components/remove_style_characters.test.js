let removeStyleCharacters = require('../../shared/remove_style_characters');

test('it handles style characters at the front of the string', () => {
  let text = '*a*';
  expect(removeStyleCharacters(text)).toEqual('a');
});

test('it handles style characters after the start of the string', () => {
  let text = ' *a*';
  expect(removeStyleCharacters(text)).toEqual(' a');
});

test('it handles style characters before the end of the string', () => {
  let text = '*a* ';
  expect(removeStyleCharacters(text)).toEqual('a ');
});

test('it handles nested style characters', () => {
  let text = '_*a*_';
  expect(removeStyleCharacters(text)).toEqual('a');
});

test('it handles multiple groups of style characters', () => {
  let text = '_*a*_ *b*';
  expect(removeStyleCharacters(text)).toEqual('a b');
});

test('it ignores style characters that are not adacent to word characters', () => {
  let text = '*a b *';
  expect(removeStyleCharacters(text)).toEqual('*a b *');
});


test('it ignores escaped style characters', () => {
  let text = "_\\*a\\*_ \\*b\\*";
  expect(removeStyleCharacters(text)).toEqual('\\*a\\* \\*b\\*');
});
