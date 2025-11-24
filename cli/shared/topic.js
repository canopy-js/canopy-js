let removeStyleCharacters = require('./remove_style_characters');
require('css.escape'); /* global CSS */
const Cache = {};

class Topic {
  // There are several permutations of the topic key

  constructor(string) {
    if (!string) throw new Error('String required to instantiate Topic');
    if (Cache.hasOwnProperty(string) && Cache.hasOwnProperty(string).display) return Cache[string];

    this.display = string; // the string precisely as it appears in the expl file, even with backslashes which will get handled on the front-end

    this.mixedCase = removeStyleCharacters(string)  // the display verison sans style characters * _ ~ ` and a trailing question mark, encoding style characters
      .replace(/\\./g, (match) => match[1] === '\\' ? '\\' : match[1]) // remove backslashes that are escaping subsequent character. webkit compatible
      .normalize("NFD"); // standardize order of diacritics, necessary for mixed not just caps because request json filenames % encoded

    this.cssMixedCase = CSS.escape(this.mixedCase);

    this.url = this.mixedCase.replace(
      new RegExp('\\' + Object.keys(Topic.urlConversionRules).join('|\\'), 'g'), // this way the output of one rule isn't input to another
      match => Topic.urlConversionRules[match]
    );

    this.topicFileName = this.mixedCase.replace(
      new RegExp('\\' + Object.keys(Topic.fileNameConversionRules).join('|\\'), 'g'), // this way the output of one rule isn't input to another
      match => Topic.fileNameConversionRules[match]
    );

    this.caps = this.mixedCase // This is the string that is used to find matches between links and topic names. Not reversible.
      .toUpperCase() // We want matches to be case-insensitive
      .replace(/\?$/, '') // It should match whether or not both have trailing question marks
      .replace(/["”“’‘']/g, '') // We remove quotation marks so matches ignore them
      .replace(/(\\{2})*([.,])(?=["'')}\]]*$)/g, (m, bs) => bs ? m : '') // Allow links to contain terminal periods or commas eg he went to [["Spain."]]
      .replace(/\(/g, '') // we remove parentheses to allow link texts to contain optional parentheses
      .replace(/\)/g, '')
      .replace(/ +/g, ' ') // consolidate spaces
      .replace(/&[Nn][Bb][Ss][Pp];/g, ' ')
      .trim(); // remove initial and leading space, eg when using interpolation syntax: [[{|display only} actual topic name]]

    this.jsonFileName = encodeURIComponent(this.mixedCase);
    this.requestFileName = encodeURIComponent(encodeURIComponent(this.mixedCase)); // This is the string that will be used to _request_ the file name on disk, so it needs to be encoded

    Cache[string] = this;
  }

  static urlConversionRules = {
    '%': '%25',
    '#': '%5C#', // The %5C is enough to know # is name-# not path-#, so we preserve human-readability ie %5C#1 not %5C%231
    '/': '%2F',
    ' ': '_', // underscore rules
    '_': '%5C_',
    '\\': '%5C%5C',
  };

  static fileNameConversionRules = {
    '%': '%25', // encoding % ensures no collisions for other rules
    '"': '%22',
    '\'': '%27',
    '/': '%2F',
    ',': '%2C',
    ':': '%3A',
    '<': '%3C',
    '>': '%3E',
    '|': '%7C',
    '*': '%2A',
    '?': '%3F',
    ' ': '_', // underscore rules
    '_': '%5C_',
    '\\': '%5C%5C',
  };

  static spaceToUnderscoreRules = {
    '%': '%25',
    ' ': '_',
    '_': '%5C_',
    '\\': '%5C%5C'
  };

  static underscoreToSpaceRules = {
    '%5C%5C': '\\\\', // this is first so that all even-numbered backslashes get converted
    '%5C_': '_',
    '_': ' '
  };

  static fromMixedCase(string) {
    string = string.replace(/([`_~*\\])/g, '\\$1'); // In mixed case style character literals are unescaped, so we escape them to avoid double-processing, same for \\
    let topic = new Topic(string);
    topic.display = null; // If a topic instance was instantiated from the mixed-case string, the display version is irretrievable
    return topic;
  }

  static fromReference(string) { // backslashes eg \# should be removed, unlike from mixed case
    let topic = new Topic(string);
    topic.display = null; // If a topic instance was instantiated from something other than the original topic key ie display, it is irreversible
    return topic;
  }

  static fromUrl(string) { // eg %5C_Topic_names_with_literal_underscores%5C_ which needs decoding and then is mixed case already _X_
    let convertedString = string.replace(
      new RegExp('\\' + Object.keys(Topic.underscoreToSpaceRules).join('|\\'), 'g'),
      match => Topic.underscoreToSpaceRules[match]
    );
    let decodedString = decodeURIComponent(convertedString); // turns eg %5C_ into \_
    let escapedString = decodedString.replace(/\\./g, (match) => match[1] === '\\' ? '\\' : match[1]);
    return Topic.fromMixedCase(escapedString);
  }

  static fromFileName(string) {
    let convertedString = string.replace(
      new RegExp('\\' + Object.keys(Topic.underscoreToSpaceRules).join('|\\'), 'g'),
      match => Topic.underscoreToSpaceRules[match]
    );
    let decodedString = decodeURIComponent(convertedString); // because all file name rules are simple encodings, simple decoding suffices
    let escapedString = decodedString.replace(/\\./g, (match) => match[1] === '\\' ? '\\' : match[1]);
    return Topic.fromMixedCase(escapedString);
  }

  static convertSpacesToUnderscores(string) {
    return string.replace(
      new RegExp('\\' + Object.keys(Topic.spaceToUnderscoreRules).join('|\\'), 'g'),
      match => Topic.spaceToUnderscoreRules[match]
    );
  }

  static convertUnderscoresToSpaces(string) {
    let convertedString = string.replace(
      new RegExp('\\' + Object.keys(Topic.underscoreToSpaceRules).join('|\\'), 'g'),
      match => Topic.underscoreToSpaceRules[match]
    );
    let decodedString = decodeURIComponent(convertedString);
    let escapedString = decodedString.replace(/\\./g, (match) => match[1] === '\\' ? '\\' : match[1]);
    return escapedString;
  }

  static parseUrlSegment(segmentString) {
    let match = segmentString.match(/((?:(?:(?:\\|%5C)#)|[^#])*)(?:#(.*))?/);
    return [match[1] && Topic.fromUrl(match[1]), match[2] && Topic.fromUrl(match[2]) || null];
  }

  static areEqual(topic1, topic2) {
    return topic1.mixedCase === topic2.mixedCase;
  }

  static for(string) {
    return new Topic(string);
  }
}

Topic.prototype.equals = function(otherTopic) {
  return this.mixedCase === otherTopic.mixedCase;
};

Topic.prototype.matches = function(otherTopic) {
  return this.caps === otherTopic.caps;
};

module.exports = Topic;
