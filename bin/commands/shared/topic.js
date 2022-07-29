let removeStyleCharacters = require('./remove_style_characters');

class Topic {
  // There are several permutations of the topic key:
  // There is the "display" topic, this is the string precisely as it appears in the expl file
  // There is a "mixed case" topic, which is the displayTopic sans style characters * _ ~ ` and a trailing question mark.
  // There is an all caps topic, this is the mixed case topic but all caps, used for case-insensitive matching
  // Filenames are the mixed case topic name sans characters that cause problems in file paths, like quotation marks.
  constructor(string) {
    this.display = string.replace(/\\/g, '');
    this.mixedCase = decodeURIComponent(removeStyleCharacters(this.display).replace(/\?$/, ''));
    this.escapedMixedCase = this.mixedCase.replace(/"/g, '\\"').replace(/'/g, "\\'");
    this.slug = this.mixedCase.replace(/ /g, '_');
    this.encodedSlug = this.mixedCase.replace(/ /g, '_').replace(/#/g, '%23');
    this.caps = this.mixedCase.toUpperCase();
    this.fileName = encodeURIComponent(this.slug);
    this.capsFile = this.fileName.toUpperCase();
  }
}

module.exports = Topic;
