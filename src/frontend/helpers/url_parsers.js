const topicNameFromUrl = () => {
  return window.location.pathname.replace('/', '');
};

const subtopicNameFromUrl = () => {
  return window.location.hash.replace('#', '');
};

export {
  topicNameFromUrl,
  subtopicNameFromUrl
};
