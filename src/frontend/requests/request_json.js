import { slugFor } from 'helpers/identifiers';

const requestJson = (topicName, success) => {
  fetch('data/' + slugFor(topicName.toLowerCase()) + '.json').
    then(res => res.json()).
    then(json => {success(json)});
}

export default requestJson;
