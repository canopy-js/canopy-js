import capitalize from 'helpers/capitalize';

test('it capitalizes a word', () => {
  expect(capitalize('america')).toBe('America');
});
