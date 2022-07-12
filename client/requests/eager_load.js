import { projectPathPrefix } from 'helpers/getters';
import { slugFor } from 'helpers/identifiers';
import REQUEST_CACHE from 'requests/request_cache';
import TopicName from 'requests/topic_name';

function eagerLoad(topicNameString) {
  if (REQUEST_CACHE[topicNameString]) return;

  let topicName = new TopicName(topicNameString);
  let dataPath = projectPathPrefix + '/_data/' + topicName.fileName + '.json';

  return fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        REQUEST_CACHE[topicName] = json;
        return json;
      });
    });
}

export default eagerLoad;
