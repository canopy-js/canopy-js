import clausesWithPunctationOf from './clauses_with_punctuation_of';

test('it seperates regular clauses', () => {
  let data = "Hello world. This is a clause. This is another clause.";
  let expectation = ["Hello world.", " This is a clause.", " This is another clause."];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});
