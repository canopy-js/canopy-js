const topicNameFromUrl = () => {
  var match = window.location.href.match(/\/(\w+)(?:#\w*)$/);
  if(!match) {
    return null;
  }

  return match[1];
}

const subtopicNameFromUrl = () => {
  var match = window.location.href.match(/\/\w+#(\w+)$/);
  if(!match) {
    return null;
  }

  return match[1];
}

export {
  topicNameFromUrl,
  subtopicNameFromUrl
};
