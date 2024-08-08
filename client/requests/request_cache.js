import { defaultTopic, defaultTopicJson } from 'helpers/getters';

let REQUEST_CACHE = {};

if (defaultTopicJson()) {
  REQUEST_CACHE[defaultTopic()] = Promise.resolve(JSON.parse(defaultTopicJson()));
}

export default REQUEST_CACHE;
