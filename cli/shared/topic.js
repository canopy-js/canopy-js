let removeStyleCharacters = require('./remove_style_characters');
require('css.escape');

class Topic {
  // There are several permutations of the topic key

  constructor(string) {
    this.display = string; // the string precisely as it appears in the expl file

    this.mixedCase = removeStyleCharacters(string)  // the display verison sans style characters * _ ~ ` and a trailing question mark, encoding style characters
      .split(/\\\\/g).map(string => string.replace(/\\/g, '')).join('\\\\'); // Remove backslashes that are escaping literal characters now that removeStyleCharacters has already run

    this.escapedMixedCase = CSS.escape(this.mixedCase);

    this.slug = this.mixedCase // This string encodes characters that will cause problems in the URL, but we do not encode all characters eg quotation marks. Must be reversable.
      .replace(/%/g, '%25') // This way you can't have collisions if the user names something with a % which we're using for encodings
      .replace(/\\\\/g, '%5C%5C') // a double backslash represents a literal backslash not an escape character
      .replace(/`/g, '%60') // Chrome automatically replaces in URL and could be misinterpreted on the command line as subshell
      .replace(/_/g, '%5C_') // Literal style characters are escaped so that when we parse the URL, we don't remove them with removeStyleCharacters
      .replace(/ /g, '_'); // This must be done after literal underscores have received encoded backslashes above to distinguish between them and these

    this.url = this.slug
      .replace(/#/g, '%23')

    this.fileName = this.slug // This string encodes characters that will cause problems in the URL, but we do not encode all characters eg quotation marks. Must be reversable.
      .replace(/"/g, '%22')
      .replace(/'/g, '%27')
      .replace(/:/g, '%3A')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/\|/g, '%7C')
      .replace(/\*/g, '%2A')
      .replace(/\?/g, '%3F');

    this.caps = this.mixedCase // This is the string that is used to find matches between links and topic names.
      .toUpperCase() // We want matches to be case-insensitive
      .replace(/\?$/, '') // It should match whether or not both have trailing question marks
      .replace(/["”“’‘']/g, '') // We remove quotation marks so matches ignore them
      .replace(/\(/g, '') // we remove parentheses to allow link texts to contain optional parentheses
      .replace(/\)/g, '')
      .replace(/ +/g, ' ') // consolidate spaces
      .trim() // remove initial and leading space, eg when using interpolation syntax: [[{|display only} actual topic name]]

    this.requestFileName = encodeURIComponent(this.fileName); // This is the string that will be used to _request_ the file name on disk, so it needs to be encoded
  }

  static fromMixedCase(string) {
    string = string.replace(/([`_~*])/g, '\\$1'); // In mixed case style character literals are unescaped, so we escape them to avoid double-processing
    let topic = new Topic(string);
    topic.display = null; // If a topic instance was instantiated from the mixed-case string, the display version is irretrievable
    return topic;
  }

  static fromEncodedSlug(string) {
    string = convertUnderscoresToSpaces(string);
    string = decodeURIComponent(string);
    string = string
      .replace(/\*/g, '\\*') // underscores are escaped in the URL itself, but for the other style characters we must escape them so that
      .replace(/`/g, '\\`')  // they don't get stripped by removeStyleCharacters
      .replace(/~/g, '\\~');

    let topic = new Topic(string); // Encoded style characters decode to escaped style characters, so we can use the regular
                                   // "display -> mixed case" processing step, even though this isn't the display string
    topic.display = null; // The encoded slug was formed from the lossy mixed case version, so that is the best we can reconstruct from it
    return topic;
  }
}

Topic.convertUnderscoresToSpaces = function convertUnderscoresToSpaces(string) {
  // We want to turn underscores into spaces, but not escaped underscores ie %5C_, but yes escaped escaped underscores ie %5C%5C_
  return string.split(/%5C%5C/g) // first remove double backslashes to avoid seeing %5C%5C_ as an underscore literal instead of backslash literal followed by a space
    .map(string => string
      .split(/%5C_/g) // now remove escaped backslashes to avoid seeing them as spaces converted to underscores
      .map(string => string.replace(/_/g, ' '))
      .join('%5C_') //convert underscores not preceded by single %5C to spaces
    ).join('%5C%5C');
}

Topic.convertSpacesToUnderscores = function convertSpacesToUnderscores(string) {
  return string.split('/').map(string => Topic.for(string).fileName).join('/');
}

Topic.for = function topicFor(string) {
  return new Topic(string);
}

function convertUnderscoresToSpaces(string) {
  // We want to turn underscores into spaces, but not escaped underscores ie %5C_, but yes escaped escaped underscores ie %5C%5C_
  return string.split(/%5C%5C/g) // first remove double backslashes to avoid seeing %5C%5C_ as an underscore literal
    .map(string => string
      .split(/%5C_/g) // now remove escaped backslashes to avoid seeing them as spaces converted to underscores
      .map(string => string.replace(/_/g, ' '))
      .join('%5C_') //convert underscores not preceded by single %5C to spaces
    ).join('%5C%5C');
}

module.exports = Topic;
