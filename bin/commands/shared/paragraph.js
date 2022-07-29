class Paragraph {
  constructor(paragraphWithKey) {
    let match = paragraphWithKey.match(/^(?!-)([^:.,;]+)(?:\:|(\?))\s+/);

    if (!match) {
      return {
        key: null,
        paragraph: paragraphWithKey
      }
    }

    // Trailing question marks are part of the key, colons are not.
    let key = match[1] + (match[2] || '');
    let paragraphWithoutKey = paragraphWithKey.slice(match[0].length);

    this.key = key;
    this.text = paragraphWithoutKey;
  }
}

module.exports = Paragraph;
