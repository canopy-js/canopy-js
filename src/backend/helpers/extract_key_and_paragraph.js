function extractKeyAndParagraph(paragraphWithKey) {
  var match = paragraphWithKey.match(/([^:.,;]+):\s*(.*)/);

  if(!match) {
    return {
      key: null,
      paragraph: paragraphWithKey
    }
  }

  return {
    key: match[1],
    paragraph: match[2]
  };
}

module.exports = extractKeyAndParagraph;
