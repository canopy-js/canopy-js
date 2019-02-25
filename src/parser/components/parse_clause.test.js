import parseClause from './parse_clause';

test('it seperates regular clauses', () => {
  let data = "Hello world. This is a clause. This is another clause.";
  let expectation = ["Hello world.", " This is a clause.", " This is another clause."];

  let result = clausesWithPunctationOf(data);

  expect(result).toEqual(expectation);
});
