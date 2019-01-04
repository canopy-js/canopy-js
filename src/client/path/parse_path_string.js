const parsePathString = (pathStringArg) => {
  let pathString = pathStringArg || window.location.pathname + window.location.hash;

  let slashSeparatedUnits = pathString.
    replace(/_/g, ' ').
    split('/').
    filter((string) => string !== '');

  return slashSeparatedUnits.map((slashSeparatedUnit) => {
    let match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
    return [
      match[1] || match[2] || null,
      match[2] || match[1] || null,
    ];
  }).filter((tuple) => tuple[0] !== null);
}

export default parsePathString;
