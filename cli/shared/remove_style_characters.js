/*
This function removes style characters from a string, eg '*_a_* -> 'a'
In order to remove multiple layers of wrapping, eg *_a_*, each call removes the outermost layer,
  then, if there was a difference between the previous value and this one, we try once more.
  If there was no difference, then we have run out of style tokens and can return.
*/

function removeStyleCharacters(string) {
  let newString = string.replace(/(^|(?:.?[^\S])+)([_`*~])((?:.*?\S))\2(\W+|$)/, '$1$3$4');
  if (newString !== string) {
    return removeStyleCharacters(newString);
  } else {
    return string;
  }
}

module.exports = removeStyleCharacters;
