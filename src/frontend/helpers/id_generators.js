const toSlug = (string) => {
  if (!string) {return string}

  return string.replace(' ', '_');
}

const htmlIdFor = (string) => {
  return '_canopy_' + toSlug(string);
}

export {
  toSlug,
  htmlIdFor
};

