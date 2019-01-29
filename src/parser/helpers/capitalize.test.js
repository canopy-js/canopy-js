import capitalize from './capitalize';

test('it capitalizes a word', () => {
  expect(capitalize('america')).toBe('America');
});

test('it capitalizes a word in quotes', () => {
  expect(capitalize('"america"')).toBe('"America"');
});
