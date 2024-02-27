let removeStyleCharacters = require('./remove_style_characters');
require('css.escape');
const Cache = {};

class Topic {
  // There are several permutations of the topic key

  constructor(string) {
    if (!string) throw new Error('String required to instantiate Topic');
    if (Cache.hasOwnProperty(string) && Cache.hasOwnProperty(string).display) return Cache[string];

    this.display = string; // the string precisely as it appears in the expl file, even with backslashes which will get handled on the front-end

    this.mixedCase = removeStyleCharacters(string)  // the display verison sans style characters * _ ~ ` and a trailing question mark, encoding style characters
      .replace(/\\./g, (match) => match[1] === '\\' ? '\\' : match[1]); // remove backslashes that are escaping subsequent character. webkit compatible

    this.cssMixedCase = CSS.escape(this.mixedCase);

    this.escapedMixedCase = this.mixedCase
      .replace(/#/g, '\\#')
      .replace(/\//g, '\\/')
      .replace(/\\/g, '\\\\');

    this.url = Topic.encodeString(this.mixedCase, Topic.urlEncodingRules);

    this.fileName = Topic.encodeString(this.mixedCase, Topic.fileNameEncodingRules);

    this.caps = this.mixedCase // This is the string that is used to find matches between links and topic names. Not reversible.
      .toUpperCase() // We want matches to be case-insensitive
      .replace(/\?$/, '') // It should match whether or not both have trailing question marks
      .replace(/["”“’‘']/g, '') // We remove quotation marks so matches ignore them
      .replace(/(\\{2})*([.,])(?=["'')}\]]*$)/g, (m, bs, punc) => bs ? m : '') // Allow links to contain terminal periods or commas eg he went to [["Spain."]]
      .replace(/\(/g, '') // we remove parentheses to allow link texts to contain optional parentheses
      .replace(/\)/g, '')
      .replace(/ +/g, ' ') // consolidate spaces
      .replace(/&[Nn][Bb][Ss][Pp];/g, ' ')
      .trim() // remove initial and leading space, eg when using interpolation syntax: [[{|display only} actual topic name]]

    this.requestFileName = encodeURIComponent(this.fileName); // This is the string that will be used to _request_ the file name on disk, so it needs to be encoded

    Cache[string] = this;
  }

  static spaceToUnderscoreRules = [ // No two rules may add up to a third, eg A->B, C->D, E->BD or there is irreversible ambiguity.
    ['\\', '%5C%5C'], // we are encoding a display string where double literals are a real backslash, & decoding to produce a pseudo display string
    ['_', '%5C_'], // Where one rule eg outputs eg "AB", and another outputs "B", the former must be listed higher ie earlier to ensure reversibility
    [' ', '_']
  ];

  static fileNameEncodingRules = [
    ...this.spaceToUnderscoreRules,
    ['%', '%25'], // if we don't encode % even in file names, then there may be collisions with other encodings eg % followed by literal 3F
    ['"', '%22'],
    ["'", '%27'],
    [',', '%2C'],
    [':', '%3A'],
    ['<', '%3C'],
    ['>', '%3E'],
    ['|', '%7C'],
    ['*', '%2A'],
    ['?', '%3F']
  ];

  static urlEncodingRules = [
    ...this.spaceToUnderscoreRules,
    ['%', '%25'],
    ['`', '%60'], // Chrome automatically encodes ` in URL to %60 in window.location, so we have to know to decode it
    ['"', '%22'], // Chrome automatically encodes " in URL to %22 in window.location, so we have to know to decode it
    ['^', '%5E'], // Chrome automatically encodes ^ in URL to %5E in window.location, so we have to know to decode it
    ['/', '%2F'],
    ['#', '%5C%23']
  ];

  static encodeString(string, rules) {
    return this.processSegment(string, rules);
  }

  static decodeString(string, rules) {
    const reversedRules = rules.slice().map(([a,b]) => [b,a]);
    return this.processSegment(string, reversedRules);
  }

  static processSegment(segment, rules) {
    if (rules.length === 0) return segment; // Base case: no more rules to apply

    const [currentRule, ...remainingRules] = rules;
    return this.applyRule(segment, currentRule, remainingRules);
  }

  static applyRule(segment, rule, remainingRules) {
    const [target, replacement] = rule;
    const parts = segment.split(new RegExp(target === '\\\\' ? target : '\\' + target, 'g'));

    return parts.map((part, index) => {
      const processedPart = remainingRules.length > 0 ? this.processSegment(part, remainingRules) : part;
      return index < parts.length - 1 ? processedPart + replacement : processedPart;
    }).join('');
  }

  static fromMixedCase(string) {
    string = string.replace(/([`_~*\\])/g, '\\$1'); // In mixed case style character literals are unescaped, so we escape them to avoid double-processing, same for \\
    let topic = new Topic(string);
    topic.display = null; // If a topic instance was instantiated from the mixed-case string, the display version is irretrievable
    return topic;
  }

  static fromExpl(string) { // backslashes eg \# should be removed, unlike from mixed case
    let topic = new Topic(string);
    topic.display = null; // If a topic instance was instantiated from something other than the original topic key ie display, it is irreversible
    return topic;
  }

  static fromUrl(string) { // eg %5C_Topic_names_with_literal_underscores%5C_ which needs decoding and then is mixed case already _X_
    let decodedString = Topic.decodeString(string, Topic.urlEncodingRules);
    return Topic.fromMixedCase(decodedString); // if %5C%5C becomes \\\\, then we need to do another round of parsing before we get a mixedCase ie \\
  }

  static fromFileName(string) {
    let decodedString = Topic.decodeString(string, Topic.fileNameEncodingRules);
    let topic = Topic.for(decodedString); // decoded strings are pseudo-display not mixed-case because eg backslash literals %5C%5C are reversed to be two backslashes again
    topic.display = null; // we can't really reverse to get the original display string
    return topic;
  }

  static convertUnderscoresToSpaces(string) {
    // We want to turn underscores into spaces, but not escaped underscores ie %5C_, but yes escaped escaped underscores ie %5C%5C_
    return Topic.decodeString(string, Topic.spaceToUnderscoreRules);
  }

  static convertSpacesToUnderscores(string) {
    return Topic.encodeString(string, Topic.spaceToUnderscoreRules);
  }

  static for(string) {
    return new Topic(string);
  }
}

module.exports = Topic;
