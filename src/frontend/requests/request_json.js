import { toSlug } from 'helpers/id_generators';

const requestJson = (topicName, success) => {
  fetch('data/' + toSlug(topicName.toLowerCase()) + '.json').
    then(res => res.json()).
    then(json => {success(json)});
}

export default requestJson;
