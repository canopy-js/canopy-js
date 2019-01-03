import { slugFor } from 'helpers/identifiers';

let cache = {};

const requestJson = (topicName) => {
  if (cache[topicName]) { return Promise.resolve(cache[topicName]); }

  let dataPath = '/data/' + slugFor(topicName.toLowerCase()) + '.json';

  return fetch(dataPath).
    then(res => {
      return res.json().then((json) => {
        cache[topicName] = json;
        return json;
      });
    });
}

export default requestJson;
