function extractKeyAndParagraph(paragraphWithKey) {
  var match = paragraphWithKey.match(/^([^:.,;]+):\s+/);

  if(!match) {
    return {
      key: null,
      block: paragraphWithKey
    }
  }

  var key = match[1];
  var paragraphWithoutKey = paragraphWithKey.slice(match[0].length);

  return {
    key: key,
    block: paragraphWithoutKey
  };
}

export default extractKeyAndParagraph;
