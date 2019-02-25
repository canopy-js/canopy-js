import { TextToken } from 'components/tokens';
import flat from 'array.prototype.flat';

function consolidateTextTokens(tokenArray) {
  if (tokenArray.length === 0) { return []; }

  let nextToken;
  let numberOfTokensProcessed;

  if (tokenArray[0].type !== 'text') {
    nextToken = tokenArray[0];
    numberOfTokensProcessed = 1;
  } else {
    let indexAfterLastTextToken = tokenArray.findIndex((item) => item.type !== 'text');
    numberOfTokensProcessed = indexAfterLastTextToken > -1 ? indexAfterLastTextToken : tokenArray.length;

    nextToken = new TextToken(
      tokenArray.slice(0, numberOfTokensProcessed).map((token) => token.text).join('')
    )
  }

  return flat([
    nextToken,
    consolidateTextTokens(
      tokenArray.slice(numberOfTokensProcessed)
    )
  ]);
}

export default consolidateTextTokens;
