import { canopyContainer, defaultTopic, projectPathPrefix } from 'helpers/getters';
import updateView from 'display/update_view';
import REQUEST_CACHE from 'requests/request_cache';
import Path from 'models/path';

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];
  let dataPath = (projectPathPrefix ? '/' + projectPathPrefix : '') + '/_data/' + topic.requestFileName + '.json';

  let promise = fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        return json;
      });
    }).catch(() => {
      REQUEST_CACHE[topic.mixedCase] = undefined; // in case error is connectivity related & will work again later
      return Promise.reject(new Error(`Unable to find topic file: "${topic.requestFileName}"`));
    });

  REQUEST_CACHE[topic.mixedCase] = promise;

  return promise;
}

export default requestJson;
