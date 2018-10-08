import capitalize from './capitalize';

test('it capitalizes a word', () => {
  expect(capitalize('america')).toBe('America');
});
