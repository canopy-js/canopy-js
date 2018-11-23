import { slugFor } from 'helpers/identifiers';

var cache = {};

const requestJson = (topicName) => {
  if (cache[topicName]) { return Promise.resolve(cache[topicName]); }

  var dataPath = 'data/' + slugFor(topicName.toLowerCase()) + '.json';

  return fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        cache[topicName] = json;
        return json;
      });
    });
}

export default requestJson;
