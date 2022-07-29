import { slugFor } from 'helpers/identifiers';
import { canopyContainer, defaultTopic, projectPathPrefix } from 'helpers/getters';
import updateView from 'display/update_view';
import REQUEST_CACHE from 'requests/request_cache';
import Path from 'models/path';

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];
  let dataPath = projectPathPrefix + '/_data/' + topic.fileName + '.json';

  let promise = fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        return json;
      });
    }).catch((e) => {
      if (canopyContainer.childNodes.length === 0 && topicName !== defaultTopic) {
        updateView(Path.default);
      }
      return Promise.reject(`Unrecognized topic: "${topic.mixedCase}"`);
    });

  REQUEST_CACHE[topic.mixedCase] = promise;

  return promise;
}

export default requestJson;
