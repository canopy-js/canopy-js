import { slugFor } from 'helpers/identifiers';

function pathStringFor(pathArray) {
  return pathArray.map((tuple) => {
    return slugFor(tuple[0]) +
      (tuple[1] && tuple[1] !== tuple[0] ? ('#' + slugFor(tuple[1])) : '')
  }).join('/');
}

export default pathStringFor;
