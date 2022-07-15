import { slugFor } from 'helpers/identifiers';
import { canopyContainer, defaultTopic, projectPathPrefix } from 'helpers/getters';
import updateView from 'display/update_view';
import REQUEST_CACHE from 'requests/request_cache';
import Path from 'models/path';
import TopicName from 'requests/topic_name';

const requestJson = (topicNameString) => {
  if (REQUEST_CACHE[topicName]) return Promise.resolve(REQUEST_CACHE[topicName]);

  let topicName = new TopicName(topicNameString);
  let dataPath = projectPathPrefix + '/_data/' + topicName.fileName + '.json';

  return fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        REQUEST_CACHE[topicName] = json;
        return json;
      });
    }).catch((e) => {
      if (canopyContainer.childNodes.length === 0 && topicName !== defaultTopic) {
        updateView(Path.default)
      }
      return Promise.reject(`Unrecognized topic: "${topicName.mixedCase}"`);
    });
}

export default requestJson;
