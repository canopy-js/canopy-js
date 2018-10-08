function clausesWithPunctuationOf(string, icOnly) {
  if (!string) {
    return [];
  }

  if (string.indexOf('\n') !== -1) {
    string = string.slice(0, string.indexOf('\n'));
  }

  var clausesWithPunctuation = [];
  var buffer = '';

  while (string.length) {
    var indexOfNextStop = -1;
    for (var i = 0; i < string.length; i++) {
      var stops = ['.', '!', '?', ',', ';', ':'];
      if (stops.indexOf(string[i]) > -1) {
        indexOfNextStop = i;
        break;
      }
    }

    if (indexOfNextStop === -1) {
      if (icOnly) {
        return [buffer + string];
      } else {
        clausesWithPunctuation.push(buffer + string);
      }
      break;
    }

    var charactersThatFollowClauseBreaks = [undefined, ' ', ')', '"', "'"];

    var validClauseBreak = charactersThatFollowClauseBreaks.
      indexOf(string[indexOfNextStop + 1]) !== -1;

    if (validClauseBreak) {
      if (icOnly) {
        return [
          buffer +
          string.slice(0, indexOfNextStop) +
          closingPunctuationOf(string.slice(indexOfNextStop + 1))
        ];
      }

      var clauseString = buffer + string.slice(0, indexOfNextStop + 1);
      var closingPunctuation = closingPunctuationOf(string.slice(indexOfNextStop + 1));
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
