class Paragraph {
  constructor(textWithKey) {
    // A key is a non-hyphen-initial string of characters that are not unescaped colons, periods, commands or semi-colons,
    // which are followed by a colon or a question mark followed by white space. If the delimiter is a colon, it is not part
    // of the "key", if the delimeter is a question mark, it is part of the key. White space after the colon or question mark
    // is not considered part of the key, but is matched so that it isn't part of the text either.

    // Match characters which are either not clause-terminating punctuation, or which are backslash-preceeded clause-terminating punctuation,
    // and these characters must be followed by a colon or a question mark.
    // If the terminator is a question mark or colon, accept the match, and if it is a question mark, include it in the match
    let match = textWithKey.match(/^((?:[^:.,;!]|(?<=\\)[:.,;!])+)(?::|(\?))\s+/m);

    if (!match) {
      return {
        key: null,
        text: textWithKey
      };
    }

    // Trailing question marks are part of the key, colons are not.
    let key = match[1] + (match[2] || '');
    let text = textWithKey.slice(match[0].length);

    this.key = key;
    this.text = text;
  }
}

module.exports = Paragraph;
