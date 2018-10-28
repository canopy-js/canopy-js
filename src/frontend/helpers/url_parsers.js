const topicNameFromUrl = () => {
  return window.location.pathname.replace('/', '').replace(/_/g, ' ');
};

const subtopicNameFromUrl = () => {
  return window.location.hash.replace('#', '').replace(/_/g, ' ');
};

export {
  topicNameFromUrl,
  subtopicNameFromUrl
};
