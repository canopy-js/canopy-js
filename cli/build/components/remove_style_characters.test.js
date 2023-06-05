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

test('it removes style characters that are not adjacent to word characters', () => { // now we permit this syntax
  let text = '*a b *';
  expect(removeStyleCharacters(text)).toEqual('a b ');
});

test('it removes style characters within a word', () => { // now we permit this syntax
  let text = 'a*b*c';
  expect(removeStyleCharacters(text)).toEqual('abc');
});

test('it does not remove style characters within different words', () => { // we don't permit this syntax
  let text = 'a*b c*d';
  expect(removeStyleCharacters(text)).toEqual('a*b c*d');
});

test('it ignores escaped style characters', () => {
  let text = "_\\*a\\*_ \\*b\\*";
  expect(removeStyleCharacters(text)).toEqual('\\*a\\* \\*b\\*');
});
