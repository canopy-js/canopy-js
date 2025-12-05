import { projectPathPrefix } from 'helpers/getters';
import REQUEST_CACHE from 'requests/request_cache';
import { defaultTopic, defaultTopicJson } from 'helpers/getters';
import { preloadImages } from 'requests/helpers';
import Topic from '../../cli/shared/topic';

const topicSubtopics = { [defaultTopic()]: JSON.parse(defaultTopicJson()).paragraphsBySubtopic };

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];

  let dataPath = (projectPathPrefix ? '/' + projectPathPrefix : '') + '/_data/' + topic.requestFileName + '.json';

  let promise = fetch(dataPath). // to allow preloading JSON from HTML
    then(res => {
      return res.json().then((json) => {
        preloadImages(json);
        topicSubtopics[Topic.for(json.displayTopicName).mixedCase] = json.paragraphsBySubtopic;
        return json;
      });
    }).catch(() => {
      REQUEST_CACHE[topic.mixedCase] = undefined; // in case error is connectivity related & will work again later
      return Promise.reject(new Error(`Unable to find topic file: "${topic.jsonFileName}"`));
    });

  REQUEST_CACHE[topic.mixedCase] = promise;

  return promise;
}


function getCanonicalTopic(topic, subtopic = topic) {
  let correctTopicKey = Object.keys(topicSubtopics).find(key => Topic.fromMixedCase(key).matches(topic));
  if (!correctTopicKey) return subtopic; // Totally incorrect path, will redirect
  let correctSubtopicKey = Object.keys(topicSubtopics[correctTopicKey]).find(key => Topic.fromMixedCase(key).matches(subtopic));
  if (!correctSubtopicKey) return subtopic; // not requested yet apparently
  return Topic.fromMixedCase(correctSubtopicKey);
}

export { requestJson, getCanonicalTopic };
