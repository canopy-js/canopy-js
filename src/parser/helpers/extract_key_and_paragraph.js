import withoutArticle from 'helpers/without_article';
import capitalize from 'helpers/capitalize';

function extractKeyAndParagraph(paragraphWithKey) {
  let match = paragraphWithKey.match(/^([^:.,;]+):\s+/);

  if(!match) {
    return {
      key: null,
      paragraph: paragraphWithKey
    }
  }

  let key = capitalize(withoutArticle(match[1]));
  let paragraphWithoutKey = paragraphWithKey.slice(match[0].length);

  return {
    key: key,
    paragraph: paragraphWithoutKey
  };
}

export default extractKeyAndParagraph;
