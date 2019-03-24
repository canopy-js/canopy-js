const slugFor = (string) => {
  if (!string) {return string}

  return string.replace(/ /g, '_');
}

const htmlIdFor = (topicName, subtopicName) => {
  return '_canopy_' + slugFor(topicName + '_' + subtopicName);
}

function removeMarkdownTokens(string) {
  return string.
    replace(/([^\\]|^)_/g, '$1').
    replace(/([^\\]|^)\*/g, '$1').
    replace(/([^\\]|^)`/g, '$1').
    replace(/([^\\]|^)~/g, '$1');
}

export {
  slugFor,
  htmlIdFor,
  removeMarkdownTokens
};

