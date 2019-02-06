function unitsOf(string) {
  return string.split(/\b|(?=\W)/);
}

export default unitsOf;
