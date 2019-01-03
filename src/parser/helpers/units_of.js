function unitsOf(string) {
  let units = [];
  let stops = ['.', '!', '?', ',', ';', ':'];
  let seperatingPunctuation = ['"', "'", '[', ']', '(', ')', '{', '}', '<', '>', '_', '`'];

  let start = 0;
  for (let i = 0; i < string.length; i++) {
    if (string[i] === ' ') {
      if (start !== i) {
        units.push(string.slice(start, i));
      }

      units.push(string.slice(i, i + 1));
      start = i + 1;
    } else if (seperatingPunctuation.indexOf(string[i]) !== -1) {
      if (
        string[i - 1] === ' ' ||
        (string[i + 1] === ' ' || string[i + 1] === undefined) ||
        seperatingPunctuation.indexOf(string[i + 1]) !== -1 ||
        seperatingPunctuation.indexOf(string[i - 1]) !== -1
      ) {
        if (start !== i) {
          units.push(string.slice(start, i));
        }
        units.push(string[i]);
        start = i + 1;
      }
    } else if (stops.indexOf(string[i]) !== -1) {
      if (string[i + 1] === ' ' || string[i + 1] === undefined) {
        if (start !== i) {
          units.push(string.slice(start, i));
        }
        units.push(string.slice(i, i + 1));
        start = i + 1;
      }
    } else if (string[i + 1] === undefined) {
      units.push(string.slice(start, i + 1));
    }
  }

  return units;
}

export default unitsOf;

