function subsumingPathExists(topic1, topic2, localReferenceGraph, stack=[]) {
  if (topic1 === topic2) {
    return true;
  } else if (!localReferenceGraph.hasOwnProperty(topic1)) {
    return false;
  } else if (localReferenceGraph[topic1].includes(topic2)) {
    return true;
  } else if (stack.includes(topic1)) {
    return false // reject cycles
  } else {
    stack.push(topic1);
    return localReferenceGraph[topic1].some(
      (referencedSubtopic) => subsumingPathExists(
        referencedSubtopic,
        topic2,
        localReferenceGraph,
        stack
      )
    )
  }
}

export default subsumingPathExists;
