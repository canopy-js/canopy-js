const slugFor = (string) => {
  if (!string) {return string}

  return string.replace(/ /g, '_');
}

const htmlIdFor = (topicName, subtopicName) => {
  return '_canopy_' + slugFor(topicName + '_' + subtopicName);
}

export {
  slugFor,
  htmlIdFor
};

