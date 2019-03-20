import parsePathString from 'path/parse_path_string';
import { defaultTopic } from 'helpers/getters';

function pathOrDefaultTopic() {
  let pathArray = parsePathString();
  if (pathArray.length > 0) {
    return pathArray
  } else {
    return [[defaultTopic, defaultTopic]];
  }
}

export { pathOrDefaultTopic };
