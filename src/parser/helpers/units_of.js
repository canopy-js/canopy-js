function unitsOf(string) {
  if (!string) return [];

  return string.split(/\b|(?=\W)/);
}

export default unitsOf;
