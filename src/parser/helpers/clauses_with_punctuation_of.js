function clausesWithPunctuationOf(string) {
  if (!string) {
    return [];
  }

  let clausesWithPunctuation = [];
  let buffer = '';

  while (string.length) {
    let indexOfNextStop = -1;
    for (let i = 0; i < string.length; i++) {
      let stops = ['.', '!', '?', ',', ';', ':'];
      if (stops.indexOf(string[i]) > -1) {
        indexOfNextStop = i;
        break;
      }
    }

    if (indexOfNextStop === -1) {
      clausesWithPunctuation.push(buffer + string);
      break;
    }

    let charactersThatFollowClauseBreaks = [undefined, ' ', ')', '"', "'"];

    let validClauseBreak = charactersThatFollowClauseBreaks.
      indexOf(string[indexOfNextStop + 1]) !== -1;

    if (validClauseBreak) {
      let clauseString = buffer + string.slice(0, indexOfNextStop + 1);
      let closingPunctuation = closingPunctuationOf(string.slice(indexOfNextStop + 1));
      clauseString += closingPunctuation;
      clausesWithPunctuation.push(clauseString);
      buffer = '';
      string = string.slice(indexOfNextStop + 1 + closingPunctuation.length);
    } else {
      buffer += string.slice(0, indexOfNextStop + 1);
      string = string.slice(indexOfNextStop + 1);
    }
  }

  return clausesWithPunctuation;
}

function closingPunctuationOf(string) {
  return (string.match(/^['")\]}]+/) || {})[0] || '';
}

export default clausesWithPunctuationOf;
