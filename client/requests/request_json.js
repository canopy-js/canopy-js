import { canopyContainer, defaultTopic, projectPathPrefix } from 'helpers/getters';
import Topic from '../../cli/shared/topic';
import updateView from 'display/update_view';
import REQUEST_CACHE from 'requests/request_cache';
import Path from 'models/path';
import { preloadImages } from 'requests/helpers';

const requestJson = (topic) => {
  if (REQUEST_CACHE[topic.mixedCase]) return REQUEST_CACHE[topic.mixedCase];
  let dataPath = (projectPathPrefix ? '/' + projectPathPrefix : '') + '/_data/' + topic.requestFileName + '.json';

  if (topic.mixedCase === Topic.for(defaultTopic).mixedCase) {
    return Promise.resolve(JSON.parse(decodeURIComponent(canopyContainer.dataset.defaultTopicJson)));
  }

  let promise = fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        preloadImages(json);
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
