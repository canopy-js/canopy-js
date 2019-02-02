function clausesWithPunctuationOf(string) {
//
//  This function takes a paragraph and divides it into an array of clauses.
//
//  Definitions:
//
//  [.,:;?!] = clause terminating punctuation
//  ["'()<>{}[\]] = wrapping punctuation
//  node.js = one word, two word segments
//
//  Regex:
//
//  /
//    (
//      (?:                    Match a series of word segments
//        \s*                  which may begin with whitespace.
//        (?:
//          [.,:;?!]           Words may begin with clause terminating punctuation,
//          |
//          ["'()<>{}[\]]      or wrapping punctuation.
//        )*
//        \w+                  There must be at least one word character per word.
//        ["'()<>{}[\]]*       Words can end with wrapping punctuation, but not clause-terminating punctuation.
//        \s*                  A space can separate one word from the next, or a word from subsequent clause termination.
//      )+
//
//     [.,:;?!]+               If a word is reached that _does_ end in clause separating punctuation, terminate the clause.
//     [\"\'()<>{}[\]]*        Any wrapping punctuation that follows the clause-termination is included in the clause.
//   )
// /g

  return Array.from(
    string.match(/((?:\s*(?:[.,:;?!]|["'()<>{}[\]])*\w+["'()<>{}[\]]*\s*)+[.,:;?!]+[\"\'()<>{}[\]]*)/g)
  );
}

export default clausesWithPunctuationOf;
