import unitsOf from './units_of';

test('gets the units of a regular clause', () => {
  let data = 'This is a clause.';
  let expectation = ['This', ' ', 'is', ' ', 'a', ' ', 'clause', '.'];

  let result = unitsOf(data);

  expect(result).toEqual(expectation);
});

test('gets the units of a clause with internal parenthases', () => {
  let data = 'This is (a) clause.';
  let expectation = ['This', ' ', 'is', ' ', '(', 'a', ')', ' ', 'clause', '.'];

  let result = unitsOf(data);

  expect(result).toEqual(expectation);
});

test('gets the units of a clause with external parenthases', () => {
  let data = '(This is a clause.)';
  let expectation = ['(', 'This', ' ', 'is', ' ', 'a', ' ', 'clause', '.', ')'];

  let result = unitsOf(data);

  expect(result).toEqual(expectation);
});

test('gets the units of a clause with quotes and parenthases', () => {
  let data = '("This is a clause.")';
  let expectation = ['(', '"', 'This', ' ', 'is', ' ', 'a', ' ', 'clause', '.', '"', ')'];

  let result = unitsOf(data);

  expect(result).toEqual(expectation);
});
