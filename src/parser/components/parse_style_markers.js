function parseStyleMarkers(tokensPerClausePerLine) {
  let boldFlag = false;
  let italicsFlag = false;
  let strikethroughFlag = false;

  return tokensPerClausePerLine.map(
    (tokensPerClause) => tokensPerClause.forEach(
      (token) => token.units.map(

      )
    )
  );

}

export default parseStyleMarkers;
