import clausesWithPunctutionOf from 'helpers/clauses_with_punctuation_of';
import parseClause from 'components/parse_clause';

function parseBlock(textWithoutKey, namespaceObject, currentSubtopic, currentTopic) {
  let lines = textWithoutKey.split(/\n/);

  let tokensOfBlock = [];
  lines.forEach(function(line){
    let clausesOfParagraph = clausesWithPunctutionOf(line);
    let avaliableNamespaces = [currentTopic];

    let tokensOfParagraphByClause = clausesOfParagraph.map(function(clause) {
      return parseClause(
        clause,
        namespaceObject,
        currentTopic,
        currentSubtopic,
        avaliableNamespaces
      );
    });

    let tokensOfLine = [].concat.apply([], tokensOfParagraphByClause);

    tokensOfBlock.push(tokensOfLine);
  });

  return tokensOfBlock;
}

export default parseBlock;
