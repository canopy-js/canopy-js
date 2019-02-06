function clausesWithPunctuationOf(string) {
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
//    /
//      (
//         .                    // Match one or more characters
//        (?!                   // that aren't followed by
//          [.,:;?!]+           // clause-terminal punctuation
//          ["'()<>{}[\]]*      // followed by optional wrapping punctuation
//          (\s|$)              // followed by a space or end of string.
//        )
//      )+
//      .                       // Match the last character before the punctuation,
//      [.,:;?!]+               // match the punctuation itself,
//      ["'()<>{}[\]]?          // and match match any wrapping punctuation that follows it.
//    /g
//
//

  return Array.from(
    string.match(/(.(?![.,:;?!]+["'()<>{}[\]]*(\s|$)))+.[.,:;?!]+["'()<>{}[\]]?/g)
  );
}

export default clausesWithPunctuationOf;
