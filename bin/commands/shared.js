class TopicName {
  // There are several permutations of the topic key:
  // There is the "display" topic, this is the string precisely as it appears in the expl file
  // There is a "mixed case" topic, which is the displayTopic sans style characters * _ ~ ` and a trailing question mark.
  // There is an all caps topic, this is the mixed case topic but all caps, used for case-insensitive matching
  // Filenames at some point may be url encoded versions of the mixed case topic.
  constructor(string) {
    this.display = string;
    this.mixedCase = removeStyleCharacters(string).replace(/\?$/, '');
    this.slug = slugFor(this.mixedCase);
    this.caps = this.mixedCase.toUpperCase();
  }
}

/*
This function removes style characters from a string, eg '*_a_* -> 'a'
In order to remove multiple layers of wrapping, eg *_a_*, each call removes the outermost layer,
  then, if there was a difference between the previous value and this one, we try once more.
  If there was no difference, then we have run out of style tokens and can return.
*/
function removeStyleCharacters(string) {
  let newString = string.replace(/([^_`*~A-Za-z]*)([_`*~])(.*?)\2(\W+|$)/, '$1$3$4');
  if (newString !== string) {
    return removeStyleCharacters(newString);
  } else {
    return string;
  }
}

const slugFor = (string) => {
  if (!string) {return string}

  return string.replace(/ /g, '_');
}

class Paragraph {
  constructor(paragraphWithKey) {
    let match = paragraphWithKey.match(/^(?!-)([^:.,;]+)(?:\:|(\?))\s+/);

    if (!match) {
      return {
        key: null,
        paragraph: paragraphWithKey
      }
    }

    // Trailing question marks are part of the key, colons are not.
    let key = match[1] + (match[2] || '');
    let paragraphWithoutKey = paragraphWithKey.slice(match[0].length);

    this.key = key;
    this.paragraph = paragraphWithoutKey;
  }
}

module.exports = {
  TopicName,
  removeStyleCharacters,
  Paragraph
}