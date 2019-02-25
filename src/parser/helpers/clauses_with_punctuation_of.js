function clausesWithPunctuationOf(string) {
  if (!string) return [''];
//
//  This function takes a paragraph and divides it into an array of clauses.
//
//  Definitions:
//
//  [.,:;?!] = clause terminating punctuation
//  ["'()<>{}[\]] = wrapping punctuation
//
//  Regex:
//
//
//   /
//     (?:
//       .                      Match one or more characters
//       (?!                    that are not followed by a clause termination sequence:
//         [.,:;?!]+            clause-terminal punctuation
//         ["'()<>{}[\]]*       that may be followed by wrapping punctuation
//         (\s|$)               that is followed by space or end of line.
//       )
//     )+
//     .                        Match the last character, that _is_ followed by clause termination sequence.
//     \S+                      Match the clause terminal and wrapping punctuation until the space.
//     (\s*$)?                  Include any terminal whitespace after all the clauses.
//   /g
//
//

  return Array.from(
    string.match(/(?:.(?![.,:;?!]+["'()<>{}[\]]*(\s|$)))+.\S+(\s*$)?/g)
  );
}

export default clausesWithPunctuationOf;
