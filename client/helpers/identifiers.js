const slugFor = (string) => {
  if (!string) {return string}

  return string.replace(/ /g, '_');
}

export {
  slugFor
};

