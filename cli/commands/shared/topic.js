let removeStyleCharacters = require('./remove_style_characters');
require('css.escape');

class Topic {
  // There are several permutations of the topic key

  constructor(string) {
    this.display = string; // the string precisely as it appears in the expl file

    this.mixedCase = removeStyleCharacters(string)  // the display verison sans style characters * _ ~ ` and a trailing question mark, encoding style characters
      .split(/\\\\/g).map(string => string.replace(/\\/g, '')).join('\\\\'); // Remove backslashes that are escaping literal characters now that removeStyleCharacters has already run

    this.escapedMixedCase = CSS.escape(this.mixedCase);

    this.slug = this.mixedCase // This string encodes characters that will cause problems in the URL, but we do not encode all characters eg quotation marks
      .replace(/%/g, '%25')
      .replace(/\\\\/g, '%5C%5C') // a double backslash represents a literal backslash not an escape character
      .replace(/#/g, '%23')
      .replace(/`/g, '%60') // Chrome automatically replaces in URL and could be misinterpreted on the command line as subshell
      .replace(/_/g, '%5C_') // Literal style characters are escaped so that when we parse the URL, we don't remove them with removeStyleCharacters
      .replace(/ /g, '_'); // This must be done after literal underscores have received encoded backslashes above to distinguish between them and these

    this.caps = this.mixedCase // This is the string that is used to find matches between links and topic names.
      .toUpperCase() // We want matches to be case-insensitive
      .replace(/\?$/, '') // It should match whether or not both have trailing question marks
      .replace(/"/g, '') // We remove quotation marks so matches ignore them
      .replace(/'/g, '')
      .replace(/_/g, ' '); // We de-slugify the URL and turn it to caps to retreive the given topic from the response data, but if there were literal underscores originally
                           // this information is lost. Therefore, we remove all underscores to make sure we can use the URL topic name to find the given topic.

    this.fileName = this.slug; // This is the string that will be used for the file name on disk

    this.requestFileName = encodeURIComponent(this.slug); // This is the string that will be used to _request_ the file name on disk, so it needs to be encoded
  }

  static fromMixedCase(string) {
    string = string.replace(/([`_~*])/g, '\\$1'); // In mixed case style character literals are unescaped, so we escape them to avoid double-processing
    let topic = new Topic(string);
    topic.display = null; // If a topic instance was instantiated from the mixed-case string, the display version is irretrievable
    return topic;
  }

  static fromEncodedSlug(string) {
    // We want to turn underscores into spaces, but not escaped underscores ie %5C_, but yes escaped escaped underscores ie %5C%5C_
    string = string
      .split(/%5C%5C/g) // first remove double backslashes to avoid seeing %5C%5C_ as an underscore literal
      .map(string => string
        .split(/%5C_/g) // now remove escaped backslashes to avoid seeing them as spaces converted to underscores
        .map(string => string.replace(/_/g, ' '))
        .join('%5C_') //convert underscores not preceeded by single %5C to spaces
      ).join('%5C%5C');

    string = decodeURIComponent(string);
    string = string
      .replace(/\*/g, '\\*') // underscores are escaped in the URL itself, but for the other style characters we must escape them so that
      .replace(/`/g, '\\`')  // they don't get stripped by removeStyleCharacters
      .replace(/~/g, '\\~');

    let topic = new Topic(string); // Encoded style characters decode to escaped style characters, so we can use the regular
                                   // "display -> mixed case" processing step, even though this isn't the display string
    topic.display = null; // The encoded slug was formed from the mixed case, so that is the best we can reconstruct from it
    return topic;
  }
}

module.exports = Topic;