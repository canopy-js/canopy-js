let Topic = require('../../shared/topic');
let chalk = require('chalk');

class Reference {
  constructor(string, enclosingTopic, parserContext) { // eg [[A#B/C#D|X Y]]
    this.fullText = string;
    this.enclosingTopic = enclosingTopic;
    this.parserContext = parserContext;
    this.displayText = '';
    this.targetText = '';
    this.exclusiveDisplayText = '';
    this.exclusiveTargetText = '';
    if (!this.contents) throw new Error(`Link has no contents: ${string}`);
    this.parseDisplayAndTarget(); // populates this.displayText and this.targetText
  }

  get valid() {
    return !!this.fullText.match(/^\[\[((?:\\.|(?!\[\[|\]\]).)+)\]\]$/s);
  }

  get contents() {
    return this.fullText.match(/^\[\[(.*)\]\]$/s)[1];
  }

  get empty() {
    return this.contents === '';
  }

  get hasCurlyBraces() {
    return !!this.fullText.match(/(^|[^\\])\{/);
  }

  get hasPipe() {
    return !!this.fullText.match(/^(?:\\.|[^\\])*\|/);
  }

  parseDisplayAndTarget() {
    if (!this.valid) {
      this.parserContext.registerSubsumptionConditionalError(
        chalk.red('Invalid reference string: ' + this.fullText + `\n${this.parserContext.filePathAndLineNumber}`)
      );
    }

    if (this.hasCurlyBraces) { // curly braces and pipe is interpreted as pipe literal because {a|b} is curly braces not pipe
      this.parseCurlyBraceReference();
    } else if (this.hasPipe) {
      this.parsePipeReference();
    } else {
      this.parseSimple();
    }

    this.removeNewlines();
  }

  removeNewlines() {
    this.targetText = this.targetText
      .replace(/\n/g, ' ') // Replaces all newlines with spaces
      .replace(/<br>|<BR>|<Br>|<bR>/g, ' '); // Replaces all capitalizations of '<BR>' with a space
  }

  parseCurlyBraceReference() {
    const regex = /(\{\{?)((?:(?!\}).)+)(\}\}?)|((?:\\.|[^\/{}])+)/gs;
    const segments = Array.from(this.contents.matchAll(regex));

    segments.forEach(([_, openingBraces, braceContents, closingBraces, plainText]) => {
      if (plainText) {
        this.displayText += plainText;
        this.targetText += plainText;
      } else {
        this.validateBraces(openingBraces, closingBraces);

        if (openingBraces.length === 1) {
          this.handleSingleBrace(braceContents);
        } else if (openingBraces.length === 2) {
          this.handleDoubleBrace(braceContents);
        }
      }
    });

    this.displayText = this.exclusiveDisplaySyntax ? this.exclusiveDisplayText : this.displayText;
    this.targetText = this.exclusiveTargetSyntax ? this.exclusiveTargetText : this.targetText;
  }

  validateBraces(opening, closing) {
    if (opening.length !== closing.length) {
      throw new Error(`Unbalanced curly braces in reference: ${this.fullText}`);
    }
  }

  handleSingleBrace(contents) {
    const match = contents.match(/((?:\\.|[^\\|])*?)\|((?:\\.|[^\\|])*?)$/);

    if (match) { // ie "A|B" or "A|" or "|A"
      this.targetText += match[1];
      this.displayText += match[2];
      this.exclusiveTargetText += match[1];
      this.exclusiveDisplayText += match[2];
    } else {
      this.exclusiveDisplaySyntax = true;
      this.exclusiveDisplayText += contents;
      this.targetText += contents;
    }
  }

  handleDoubleBrace(contents) {
    this.exclusiveTargetSyntax = true;
    this.exclusiveTargetText += contents;
    this.displayText += contents;
  }


  parsePipeReference() {
    if (this.contents.matchAll(/((?:\\.|[^\\])+?)\|/g).length > 1) throw `Reference has too many pipes: ${this.fullText}`
    const [_, target, display] = [...this.contents.match(/((?:\\.|[^\\])+?)\|((?:\\.|[^\\])+?)$/)];
    this.targetText = target;
    this.displayText = display;
  }

  get lastPathComponent() {
    if (this.singleTopicWithEmptyFragment) return Reference.textBeforeFragment(this.contents);
    // Regular expression to match the last unescaped slash or hash
    const match = this.contents.match(/(?:^|[^\\])(?:\\\\)*([\/#])([^\/#]*(?:\\.[^\/#]*)*)$/);
    if (match) {
      return match[2]; // Return text after the last unescaped slash or hash
    }

    return this.contents; // Return the whole string if no unescaped slash or hash is found
  }

  parseSimple() {
    this.targetText = this.contents;
    this.displayText = this.lastPathComponent;
    if (!this.displayText && this.soloPoundSign) this.displayText = 'Back';
  }

  get isPath() {
    return !!this.targetText.match(/(^|[^\\])(\\\\)*[#\/]/);
  }

  get simpleTarget() {
    return !this.isPath;
  }

  get targetAsTopic() {
    if (!this.simpleTarget) return null;
    return Topic.for(this.targetText);
  }

  get orphanFragment() {
    return !!this.targetText.match(/^#([^#\/]*(?:\\.[^#\/]*)*)$/);
  }

  get initialOrphanFragment() {
    return !!this.targetText.match(/^#([^#\/]*)/);
  }

  get soloPoundSign() {
    return !!(this.targetText === '#');
  }

  get singleTopicWithEmptyFragment() {
    return !!this.targetText.match(/^([^#\/]*(?:\\.[^#\/]*)*)#$/);
  }

  static textBeforeFragment(string) {
    const match = string.match(/^((?:\\.|[^\/])+?)#/);
    return match ? match[1] : null;
  }

  static textAfterFragment(string) {
    const match = string.match(/^(?:\\.|[^\/])*?#(.*)$/);
    return match ? match[1] : null;
  }

  static firstSegmentComponent(string) {
    return string.match(/^[^/#]*/)[0] || this.targetText;
  }

  get firstTopic() {
    return Topic.fromUrl(Reference.firstSegmentComponent(this.pathString));
  }

  get firstSubtopic() {
    let subtopicString = this.pathString.match(/^(?:\\.|[^\/])+?#((?:\\.|[^\/])+?)(?:\/.*)?$/)?.[1];
    return subtopicString ? Topic.fromUrl(subtopicString) :  null;
  }

  get localReference() {
    return this.simpleTarget && this.parserContext.currentTopicHasSubtopic(this.targetAsTopic);
  }

  get simpleGlobalReference() {
    return this.simpleTarget
      && !this.parserContext.currentTopicHasSubtopic(this.targetAsTopic)
      && this.parserContext.topicExists(this.targetAsTopic);
  }

  get pathString() {
    return [...this.displayPathString.matchAll(/(?:\\.|[^\\\/])+?(?:#(?:\\.|[^\\\/])+?)?(?:(?=\/|$))/g)].map(match => match[0]).map(segmentString => {
      let [topic, subtopic] = segmentString.match(/((?:[^#\/\\]|\\.)*)(?:[#]((?:[^#\/\\]|\\.)*))?/).slice(1).map(m => m && Topic.fromExpl(m));
      return (this.parserContext.getOriginalTopic(topic)||topic).url + // gives us original display version
        (subtopic ? ('#' + ((this.parserContext.getOriginalSubtopic(topic, subtopic)||subtopic).url)) : '');
    }).join('/');
  }

  get displayPathString() {
    if (this.soloPoundSign) { //eg [#], short for topic subtopic
      return `${this.enclosingTopic.mixedCase}#${this.enclosingTopic.mixedCase}`;
    }

    if (this.localReference) { // eg [[X]] where X is a subtopic of current topic
      // return this.localReferencePath(this.enclosingTopic, this.targetAsTopic);
      return `${this.parserContext.currentTopic.mixedCase}#${this.targetText}`;
    }

    if (this.simpleGlobalReference) { // eg [[X]] where X is only global topic
      // return this.singleSegmentGlobalReferencePath(this.targetAsTopic);
      return this.targetText;
    }

    if (this.singleTopicWithEmptyFragment) { // eg [[A#]], global reference override for subtopic collision
      // return this.singleSegmentGlobalReferencePath(
        return Reference.textBeforeFragment(this.targetText);
      // );
    }

    if (this.orphanFragment) { // eg [[#A]], global self-reference to current topic and given subtopic
      return `${this.enclosingTopic.mixedCase}#${Reference.textAfterFragment(this.targetText)}`;
    }

    if (this.initialOrphanFragment) {
      return `${this.enclosingTopic.mixedCase}#${Reference.textAfterFragment(this.targetText)}`;
    }

    return this.targetText;
  }

  static candidateSubstring(string) {
    return string.match(/^\[\[((?:\\.|[^\\])+?)\]\]/)?.[0] || '';
  }

  static for(string, enclosingTopic, parserContext) {
    return new Reference(string, enclosingTopic, parserContext);
  }
}

module.exports = Reference;
