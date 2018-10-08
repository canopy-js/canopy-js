import clausesWithPunctutionOf from '../helpers/clauses_with_punctuation_of';
import parseClause from './parse_clause';

function parseParagraph(textWithoutKey, namespaceObject, currentTopic) {
  var clausesOfParagraph = clausesWithPunctutionOf(textWithoutKey);
  var importedNamespaces = [];

  var tokensOfParagraphByClause = clausesOfParagraph.map(function(clause) {
    return parseClause(clause, namespaceObject, currentTopic, importedNamespaces);
  });

  var tokensOfParagraph = [].concat.apply([], tokensOfParagraphByClause);

  return tokensOfParagraph;
}

export default parseParagraph;
