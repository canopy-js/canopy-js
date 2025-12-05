import { projectPathPrefix, defaultTopic, defaultTopicJson } from 'helpers/getters';
import REQUEST_CACHE from 'requests/request_cache';
import { preloadImages } from 'requests/helpers';
import Topic from '../../cli/shared/topic';

const topicSubtopics = {};

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];

  const isDefault = topic.equals(Topic.fromMixedCase(defaultTopic()));
  const embeddedJson = isDefault && defaultTopicJson();

  const prefix = projectPathPrefix ? `/${projectPathPrefix}` : '';
  const dataPath = `${prefix}/_data/${topic.requestFileName}.json`;

  const sourcePromise = embeddedJson
    ? Promise.resolve(JSON.parse(embeddedJson))
    : fetch(dataPath).then(res => res.json());

  const promise = sourcePromise
    .then(json => {
      preloadImages(json);
      topicSubtopics[Topic.for(json.displayTopicName).mixedCase] = json.paragraphsBySubtopic;
      return json;
    })
    .catch(() => {
      REQUEST_CACHE[topic.mixedCase] = undefined;
      return Promise.reject(new Error(`Unable to find topic file: "${topic.jsonFileName}"`));
    });

  return REQUEST_CACHE[topic.mixedCase] = promise;
};

function getCanonicalTopic(topic, subtopic = topic) {
  let correctTopicKey = Object.keys(topicSubtopics).find(key => Topic.fromMixedCase(key).matches(topic));
  if (!correctTopicKey) return subtopic;
  let correctSubtopicKey = Object.keys(topicSubtopics[correctTopicKey]).find(key => Topic.fromMixedCase(key).matches(subtopic));
  if (!correctSubtopicKey) return subtopic;
  return Topic.fromMixedCase(correctSubtopicKey);
}

export { requestJson, getCanonicalTopic };