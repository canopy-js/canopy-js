class TopicName {
  // There are several permutations of the topic key:
  // There is the "display" topic, this is the string precisely as it appears in the expl file
  // There is a "mixed case" topic, which is the displayTopic sans style characters * _ ~ ` and a trailing question mark.
  // There is an all caps topic, this is the mixed case topic but all caps, used for case-insensitive matching
  // Filenames are the mixed case topic name sans characters that cause problems in file paths, like quotation marks.
  constructor(string) {
    this.display = string;
    this.mixedCase = removeStyleCharacters(string).replace(/\?$/, '');
    this.slug = this.mixedCase.replace(/ /g, '_');
    this.caps = this.mixedCase.toUpperCase();
    this.fileName = this.slug;
    this.capsFile = this.fileName.toUpperCase();
  }
}

function removeStyleCharacters(string) {
  let newString = string.replace(/([^_`*~A-Za-z]*)([_`*~])(.*?)\2(\W+|$)/, '$1$3$4');
  if (newString !== string) {
    return removeStyleCharacters(newString);
  } else {
    return string;
  }
}

export default TopicName;
