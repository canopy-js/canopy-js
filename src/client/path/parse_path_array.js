const parsePathString = (pathString) => {
  var pathString = pathString || window.location.pathname + window.location.hash;

  var slashSeparatedUnits = pathString.
    replace(/_/g, ' ').
    split('/').
    filter((string) => string !== '');

  return slashSeparatedUnits.map((slashSeparatedUnit) => {
    var match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
    return [
      match[1] || match[2] || null,
      match[2] || match[1] || null,
    ];
  }).filter((tuple) => tuple[0] !== null);
}

export default parsePathString;
