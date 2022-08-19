import { canopyContainer, defaultTopic, projectPathPrefix } from 'helpers/getters';
import updateView from 'display/update_view';
import REQUEST_CACHE from 'requests/request_cache';
import Path from 'models/path';

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];
  let dataPath = projectPathPrefix + '/_data/' + topic.requestFileName + '.json';

  let promise = fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        return json;
      });
    }).catch(() => {
      if (canopyContainer.childNodes.length === 0 && topic.mixedCase !== defaultTopic) {
        updateView(Path.default);
      }
      return Promise.reject(`Requesting invalid topic: "${topic.mixedCase}"`);
    });

  REQUEST_CACHE[topic.mixedCase] = promise;

  return promise;
}

export default requestJson;
