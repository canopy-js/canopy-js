function subsumingPathExists(topic1, topic2, localReferenceGraph) {
  if (topic1 === topic2) {
    return true;
  } else if (!localReferenceGraph.hasOwnProperty(topic1)) {
    return false;
  } else if (localReferenceGraph[topic1].includes(topic2)) {
    return true;
  } else {
    return localReferenceGraph[topic1].some(
      (referencedSubtopic) => subsumingPathExists(
        referencedSubtopic,
        topic2,
        localReferenceGraph
      )
    )
  }
}

export default subsumingPathExists;
