function capitalize(text) {
  return text.replace(/^\W*(\w)/, (match) => {
    return match.toUpperCase();
  });
}

export default capitalize;
