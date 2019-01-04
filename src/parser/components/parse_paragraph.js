import clausesWithPunctutionOf from 'helpers/clauses_with_punctuation_of';
import parseClause from 'components/parse_clause';

function parseParagraph(textWithoutKey, namespaceObject, currentSubtopic, currentTopic) {
  let lines = textWithoutKey.split(/\n/);

  let tokensOfParagraph = [];
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

    tokensOfParagraph.push(tokensOfLine);
  });

  return tokensOfParagraph;
}

export default parseParagraph;
