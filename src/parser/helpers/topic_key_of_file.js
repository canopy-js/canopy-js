import paragraphsOfFile from 'helpers/paragraphs_of_file';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';

function topicKeyOfFile(path) {
  let paragraphsWithKeys = paragraphsOfFile(path);
  return extractKeyAndParagraph(paragraphsWithKeys[0]).key;
}

export default topicKeyOfFile;
