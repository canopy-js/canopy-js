let removeStyleCharacters = require('./remove_style_characters');

class Topic {
  // There are several permutations of the topic key
  // The fromSlug argument is for when the topic class is instantiated with a string that was already converted to a slug, to avoid double-processing
  // This is useful eg where the topic name had literal underscores which after slugification are indistinguishable from the spaces that are now underscores

  constructor(string, fromSlug) {
    this.display = string; // the string precisely as it appears in the expl file

    this.mixedCase = removeStyleCharacters(string) // the displayTopic sans style characters * _ ~ ` and a trailing question mark.
      .replace(/\\/g, '');  // We aren't worried about the double-processing if fromSlug because anyway slugification will remove literal underscores

    this.slug = this.mixedCase // This is the string that will be used in the URL for the topic name
      .replace(/ /g, '_'); // Some underscores are real literal underscores and not spaces converted to underscores, so this is a lossy operation

    this.encodedSlug = this.slug // This string encodes characters that will cause problems in the URL, but we do not encode all characters eg quotation marks
      .replace(/%/g, '%25')
      .replace(/#/g, '%23');

    this.caps = this.mixedCase // This is the string that is used to find matches between links and topic names.
      .toUpperCase() // We want matches to be case-insensitive
      .replace(/\?$/, '') // It should match whether or not both have trailing question marks
      .replace(/"/g, '') // We remove quotation marks so matches ignore them
      .replace(/'/g, '')
      .replace(/_/g, ' '); // We de-slugify the URL and turn it to caps to retreive the given topic from the response data, but if there were literal underscores originally
                           // this information is lost. Therefore, we remove all underscores to make sure we can use the URL topic name to find the given topic.
                           // It is important that the caps version of the slug be the same as the caps version of the original,
                           // so that using only a slug we can produce the caps version, which is used to look up eg elements in the DOM

    this.fileName = this.slug // This is the string that will be used for the file name on disk
      .replace(/\\/g, '');

    this.requestFileName = encodeURIComponent(this.slug); // This is the string that will be used to _request_ the file name on disk, so it needs to be encoded

    if (fromSlug) { // These values cannot be reconstructed from a slug because it is a destructive operation
      this.display = null;
      this.mixedCase = null;
    }
  }
}

module.exports = Topic;
