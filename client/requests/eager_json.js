import Path from 'models/path';
import { requestJson } from 'requests/request_json';

const queuedPathStrings = new Set();
let queueScheduled = false;

function enqueueJsonEagerLoad(pathString) {
  if (!pathString) return;
  queuedPathStrings.add(pathString);
  scheduleQueue();
}

function scheduleQueue() {
  if (queueScheduled) return;
  queueScheduled = true;
  scheduleIdle(processNextPath);
}

function processNextPath() {
  const pathString = queuedPathStrings.values().next().value;
  if (!pathString) {
    queueScheduled = false;
    return;
  }

  queuedPathStrings.delete(pathString);

  try {
    Path.for(pathString).topicArray.forEach(topic => requestJson(topic));
  } catch {
    // Ignore malformed eager paths. Normal link execution still handles real navigation errors.
  }

  if (queuedPathStrings.size) {
    scheduleIdle(processNextPath);
  } else {
    queueScheduled = false;
  }
}

function scheduleIdle(callback) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback);
  }
}

export { enqueueJsonEagerLoad };
