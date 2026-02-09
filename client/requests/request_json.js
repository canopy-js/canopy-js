import { projectPathPrefix } from 'helpers/getters';
import REQUEST_CACHE from 'requests/request_cache';
import { preloadImages } from 'requests/helpers';
import Topic from '../../cli/shared/topic';

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase].promise;

  const embeddedTopicScript = document.querySelector(`script[data-topic-json="${topic.jsonFileName}.json"]`);
  const prefix = projectPathPrefix ? `/${projectPathPrefix}` : '';
  const dataPath = `${prefix}/_data/${topic.jsonFileName}.json`;
  const cacheEntry = {
    status: 'pending',
    json: null,
    promise: null
  };

  const dataPromise =
    (embeddedTopicScript && Promise.resolve(JSON.parse(embeddedTopicScript.textContent))) || // embedded topic JSON (default topic / single-file build)
    Promise.resolve().then(() => fetch(dataPath)) // wrap to capture sync fetch failures in the promise chain
      .then(res => {
        if (!res.ok) throw new Error(`Missing topic JSON "${topic.jsonFileName}" (status ${res.status})`);
        return res.json();
      });

  const requestPromise = dataPromise
    .then(json => {
      preloadImages(json);
      cacheEntry.status = 'fulfilled';
      cacheEntry.json = json;
      return json;
    })
    .catch(() => {
      delete REQUEST_CACHE[topic.mixedCase];
      return null; // ignore aborted fetches or navigation-related rejections
    });

  cacheEntry.promise = requestPromise;

  REQUEST_CACHE[topic.mixedCase] = cacheEntry;
  return requestPromise;
};

function getCanonicalTopic(topic, subtopic = topic) {
  const matchingEntry = Object.values(REQUEST_CACHE).find(entry =>
    entry.status === 'fulfilled' &&
    entry.json &&
    Topic.for(entry.json.displayTopicName).matches(topic)
  );

  if (!matchingEntry) return subtopic;

  const correctSubtopicKey = Object.keys(matchingEntry.json.paragraphsBySubtopic)
    .find(key => Topic.fromMixedCase(key).matches(subtopic));
  if (!correctSubtopicKey) return subtopic;
  return Topic.fromMixedCase(correctSubtopicKey);
}

export { requestJson, getCanonicalTopic };
