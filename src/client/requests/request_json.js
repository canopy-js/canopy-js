import { slugFor } from 'helpers/identifiers';
import { canopyContainer, defaultTopic, pathPrefix } from 'helpers/getters';
import updateView from 'display/update_view';

let cache = {};

const requestJson = (topicName) => {
  if (cache[topicName]) { return Promise.resolve(cache[topicName]); }

  let dataPath = pathPrefix + '/_data/' + slugFor(topicName.toLowerCase()) + '.json';

  return fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        cache[topicName] = json;
        return json;
      });
    }).catch((e) => {
      if (canopyContainer.childNodes.length === 0 && topicName !== defaultTopic) {
        updateView([[defaultTopic, defaultTopic]])
      }
      return Promise.reject("Unrecognized path: " + topicName);
    });
}

export default requestJson;
