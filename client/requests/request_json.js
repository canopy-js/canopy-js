import { slugFor } from 'helpers/identifiers';
import { canopyContainer, defaultTopic, projectPathPrefix } from 'helpers/getters';
import updateView from 'display/update_view';
import REQUEST_CACHE from 'requests/request_cache';
import Path from 'models/path';

const requestJson = (topicName) => {
  if (REQUEST_CACHE[topicName]) return Promise.resolve(REQUEST_CACHE[topicName]);

  let dataPath = projectPathPrefix + '/_data/' + slugFor(topicName) + '.json';

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
      return Promise.reject("Unrecognized path: " + topicName);
    });
}

export default requestJson;
