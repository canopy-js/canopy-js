import clausesWithPunctationOf from './clauses_with_punctuation_of';

test('it seperates regular clauses', () => {
  let data = "Hello world. This is a clause. This is another clause.";
  let expectation = ["Hello world.", " This is a clause.", " This is another clause."];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});

test('it does not seperate words with periods', () => {
  let data = "Hello world. This is a clause about the node.js library.";
  let expectation = ["Hello world.", " This is a clause about the node.js library."];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});

test('it includes wrapping punctuation in the clause', () => {
  let data = "Hello world. (This is a second clause.) This is a third clause.";
  let expectation = ["Hello world.", " (This is a second clause.)", " This is a third clause."];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});

test('it allows wrapping punctuation within the clause', () => {
  let data = "Hello world. This is a (second) clause. This is a third clause.";
  let expectation = ["Hello world.", " This is a (second) clause.", " This is a third clause."];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});

test('it allows there to be a space before the closing punctuation', () => {
  let data = "Hello world. This is a second clause !";
  let expectation = ["Hello world.", " This is a second clause !"];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});

test('if the last clause does not terminate, it includes it as a clause', () => {
  let data = "Hello world. This is a clause. This is another clause";
  let expectation = ["Hello world.", " This is a clause.", " This is another clause"];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});
