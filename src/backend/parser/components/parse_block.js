import clausesWithPunctutionOf from '../helpers/clauses_with_punctuation_of';
import parseClause from './parse_clause';

function parseBlock(textWithoutKey, namespaceObject, currentSubtopic, currentTopic) {
  var lines = textWithoutKey.split(/\n/);

  var tokensOfBlock = [];
  lines.forEach(function(line){
    var clausesOfParagraph = clausesWithPunctutionOf(line);
    var importedNamespaces = [];

    var tokensOfParagraphByClause = clausesOfParagraph.map(function(clause) {
      return parseClause(
        clause,
        namespaceObject,
        currentTopic,
        currentSubtopic,
        importedNamespaces
      );
    });

    var tokensOfLine = [].concat.apply([], tokensOfParagraphByClause);

    tokensOfBlock.push(tokensOfLine);
  });

  return tokensOfBlock;
}

export default parseBlock;
