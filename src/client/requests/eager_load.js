import { projectPathPrefix } from 'helpers/getters';
import { slugFor } from 'helpers/identifiers';
import REQUEST_CACHE from 'requests/request_cache';

function eagerLoad(topicName) {
  if (REQUEST_CACHE[topicName]) return;
  let dataPath = projectPathPrefix + '/data/' + slugFor(topicName.toLowerCase()) + '.json';

  return fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        REQUEST_CACHE[topicName] = json;
        return json;
      });
    });
}

export default eagerLoad;
