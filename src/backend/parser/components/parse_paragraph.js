var clausesWithPunctutionOf = require('../helpers/clauses_with_punctuation_of');
var parseClause = require('./parse_clause');

function parseParagraph(textWithoutKey, namespaceObject, currentTopic) {
  var clausesOfParagraph = clausesWithPunctutionOf(textWithoutKey);
  var importedNamespaces = [];

  var tokensOfParagraphByClause = clausesOfParagraph.map(function(clause) {
    return parseClause(clause, namespaceObject, currentTopic, importedNamespaces);
  });

  var tokensOfParagraph = [].concat.apply([], tokensOfParagraphByClause);

  return tokensOfParagraph;
}

module.exports = parseParagraph;
