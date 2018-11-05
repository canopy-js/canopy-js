import { slugFor } from 'helpers/identifiers';

const requestJson = (topicName, success, error) => {
  fetch('data/' + slugFor(topicName.toLowerCase()) + '.json').
    then(res => res.json()).
    catch(function(e) {
      error(e)
    }).
    then(json => {
      if (json) {
        success(json)
      }
    });
}

export default requestJson;
