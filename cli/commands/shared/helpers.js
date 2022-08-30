function convertUnderscoresToSpaces(string) {
  // We want to turn underscores into spaces, but not escaped underscores ie %5C_, but yes escaped escaped underscores ie %5C%5C_
  return string.split(/%5C%5C/g) // first remove double backslashes to avoid seeing %5C%5C_ as an underscore literal
    .map(string => string
      .split(/%5C_/g) // now remove escaped backslashes to avoid seeing them as spaces converted to underscores
      .map(string => string.replace(/_/g, ' '))
      .join('%5C_') //convert underscores not preceeded by single %5C to spaces
    ).join('%5C%5C');
}

module.exports = { convertUnderscoresToSpaces };
