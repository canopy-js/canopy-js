import { projectPathPrefix } from 'helpers/getters';
import REQUEST_CACHE from 'requests/request_cache';
import { preloadImages } from 'requests/helpers';
import Topic from '../../cli/shared/topic';

const topicSubtopics = {};

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];

  const embeddedTopicScript = document.querySelector(`script[data-topic-json="${topic.jsonFileName}.json"]`);
  const prefix = projectPathPrefix ? `/${projectPathPrefix}` : '';
  const dataPath = `${prefix}/_data/${topic.jsonFileName}.json`;

  const dataPromise =
    (embeddedTopicScript && Promise.resolve(JSON.parse(embeddedTopicScript.textContent))) // embedded topic JSON (default topic / single-file build)
    || Promise.resolve().then(() => fetch(dataPath)) // wrap to capture sync fetch failures in the promise chain
      .then(res => {
      if (!res.ok) throw new Error(`Missing topic JSON "${topic.jsonFileName}" (status ${res.status})`);
      return res.json();
    })
    .then(json => {
      preloadImages(json);
      topicSubtopics[Topic.for(json.displayTopicName).mixedCase] = json.paragraphsBySubtopic;
      return json;
    })
    .catch(() => {
      REQUEST_CACHE[topic.mixedCase] = undefined;
      return Promise.resolve(null); // ignore aborted fetches or navigation-related rejections
    });

  return REQUEST_CACHE[topic.mixedCase] = dataPromise;
};

function getCanonicalTopic(topic, subtopic = topic) {
  let correctTopicKey = Object.keys(topicSubtopics).find(key => Topic.fromMixedCase(key).matches(topic));
  if (!correctTopicKey) return subtopic;
  let correctSubtopicKey = Object.keys(topicSubtopics[correctTopicKey]).find(key => Topic.fromMixedCase(key).matches(subtopic));
  if (!correctSubtopicKey) return subtopic;
  return Topic.fromMixedCase(correctSubtopicKey);
}

export { requestJson, getCanonicalTopic };
