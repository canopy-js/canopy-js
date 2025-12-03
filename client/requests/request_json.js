import { projectPathPrefix } from 'helpers/getters';
import REQUEST_CACHE from 'requests/request_cache';
import { preloadImages } from 'requests/helpers';

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];

  let dataPath = (projectPathPrefix ? '/' + projectPathPrefix : '') + '/_data/' + topic.requestFileName + '.json';

  let promise = fetch(dataPath). // to allow preloading JSON from HTML
    then(res => {
      return res.json().then((json) => {
        preloadImages(json);
        return json;
      });
    }).catch(() => {
      REQUEST_CACHE[topic.mixedCase] = undefined; // in case error is connectivity related & will work again later
      return Promise.reject(new Error(`Unable to find topic file: "${topic.jsonFileName}"`));
    });

  REQUEST_CACHE[topic.mixedCase] = promise;

  return promise;
}

export default requestJson;
