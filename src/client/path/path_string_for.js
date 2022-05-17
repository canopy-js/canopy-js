import { slugFor } from 'helpers/identifiers';
import { projectPathPrefix } from 'helpers/getters';

function pathStringFor(pathArray) {
  return (projectPathPrefix ? '/' + projectPathPrefix : '') +
    '/' + pathArray.map((tuple) => {
      return slugFor(tuple[0]) +
        (tuple[1] && tuple[1] !== tuple[0] ? ('#' + slugFor(tuple[1])) : '');
    }).join('/');
}

export default pathStringFor;
