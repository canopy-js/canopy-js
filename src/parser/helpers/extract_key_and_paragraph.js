function extractKeyAndParagraph(paragraphWithKey) {
  let match = paragraphWithKey.match(/^([^:.,;]+):\s+/);

  if (!match) {
    return {
      key: null,
      paragraph: paragraphWithKey
    }
  }

  let key = match[1];
  let paragraphWithoutKey = paragraphWithKey.slice(match[0].length);

  return {
    key: key,
    paragraph: paragraphWithoutKey
  };
}

export default extractKeyAndParagraph;
