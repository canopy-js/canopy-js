function sentencesWithPunctuationOf(string) {
  if (!string) return [''];
//
//  This function takes a paragraph and divides it into an array of clauses.
//
//  Definitions:
//
//  [.,:;?!] = sentence terminating punctuation
//  ["'()<>{}[\]] = wrapping punctuation
//
//  Regex:
//
//
//   /
//     (?:
//       .                      Match one or more characters
//       (?!                    that are not followed by a sentence termination sequence:
//         [.?!]+               sentence-terminal punctuation
//         ["'()<>{}[\]]*       that may be followed by wrapping punctuation
//         (\s|$)               that is followed by space or end of line.
//       )
//     )+
//     .?                       Match a last character, that _is_ followed by sentence termination sequence.
//     \S+                      Match the sentence-terminal and wrapping punctuation until the space.
//     (\s*$)?                  Include any terminal whitespace after all the clauses.
//   /g
//
//

  let match = string.match(/(?:.(?![.,:;?!]+["'()<>{}[\]]*(\s|$)))+.?\S*(\s*$)?/g);

  if (!match) {
    throw "Could not parse string: '" + string + "'";
  }

  return Array.from(match);
}

export default sentencesWithPunctuationOf;
