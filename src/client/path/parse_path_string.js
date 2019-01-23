const parsePathString = (pathStringArg) => {
  let pathString = pathStringArg || window.location.pathname + window.location.hash;

  let slashSeparatedUnits = pathString.
    replace(/_/g, ' ').
    split('/').
    filter((string) => string !== '');

  slashSeparatedUnits = fixAccidentalSeparationofTopicAndSubtopic(pathString, slashSeparatedUnits);

  return slashSeparatedUnits.map((slashSeparatedUnit) => {
    let match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
    return [
      match[1] || match[2] || null,
      match[2] || match[1] || null,
    ];
  }).filter((tuple) => tuple[0] !== null);
}

function fixAccidentalSeparationofTopicAndSubtopic(pathString, slashSeparatedUnits) {
  // eg /Topic/#Subtopic/A#B  -> /Topic#Subtopic/A#B
  if (pathString.match(/^\/\w+\/#\w+\/?/)) {
    let newFirstItem = slashSeparatedUnits[0] + slashSeparatedUnits[1];
    let newArray = slashSeparatedUnits.slice(2);
    newArray.unshift(newFirstItem);
    return newArray;
  }

  return slashSeparatedUnits;
}

export default parsePathString;
