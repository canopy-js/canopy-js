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
  if (pathString.match(/\/\w+\/#\w+\/?/)) {
    let newLastItem = slashSeparatedUnits[slashSeparatedUnits.length - 2] +
      slashSeparatedUnits[slashSeparatedUnits.length - 1];
    let newArray = slashSeparatedUnits.slice(0, slashSeparatedUnits.length - 2);
    newArray.push(newLastItem);
    return newArray;
  }

  return slashSeparatedUnits;
}

export default parsePathString;
