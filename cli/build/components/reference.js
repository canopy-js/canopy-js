let Topic = require('../../shared/topic');
let chalk = require('chalk');

class Reference {
  constructor(string, parserContext) { // eg [[A#B/C#D|X Y]]
    this.fullText = string;
    this.enclosingTopic = parserContext.currentTopic;
    this.enclosingSubtopic = parserContext.currentSubtopic;
    this.parserContext = parserContext;
    this.displayText = '';
    this.targetText = '';
    this.exclusiveDisplayText = '';
    this.exclusiveTargetText = '';
    if (!this.contents) {
      throw new Error(chalk.red('Link has no contents: ' + string + `\n${this.parserContext.currentFilePathAndLineNumber}`));
    }
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
    return !!this.sanitizeLiteralHtmlBraces(this.contents).match(/(^|[^\\])\{/);
  }

  get hasPipe() {
    let braceDepth = 0;

    for (let i = 0; i < this.contents.length; i += 1) {
      const character = this.contents[i];
      if (this.characterIsEscaped(this.contents, i)) continue;

      if (character === '{') {
        braceDepth += 1;
        continue;
      }

      if (character === '}' && braceDepth > 0) {
        braceDepth -= 1;
        continue;
      }

      if (character === '|' && braceDepth === 0 && i > 0) {
        return true;
      }
    }

    return false;
  }

  parseDisplayAndTarget() {
    if (!this.valid) {
      this.parserContext.registerSubsumptionConditionalError(
        chalk.red('Invalid reference string: ' + this.fullText + `\n${this.parserContext.currentFilePathAndLineNumber}`)
      );
    }

    if (this.hasPipe) { // if pipe, only HTML-style {{}} insertions are valid brace syntax
      this.validatePipeCompatibleBraces();
      this.parsePipeReference();
    } else if (this.hasCurlyBraces) { // if not pipe, {{ is certainly link syntax or HTML would be in link target text
      this.parseCurlyBraceReference();
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

  sanitizeLiteralHtmlBraces(string) {
    return string.replace(
      /<([A-Za-z][\w:-]*)\b[^>]*>\s*(\{\{[\s\S]*?}})\s*<\/\1>/g,
      (match, tagName, braceText) => match.replace(braceText, '\uE000'.repeat(braceText.length))
    );
  }

  validatePipeCompatibleBraces() {
    for (let i = 0; i < this.contents.length; i += 1) {
      if (this.contents[i] !== '{' && this.contents[i] !== '}') continue;
      if (this.characterIsEscaped(this.contents, i)) continue;

      if (this.contents.slice(i, i + 2) === '{{') {
        const closingIndex = this.findClosingDoubleBrace(i + 2);
        const precedingCharacter = i > 0 ? this.contents[i - 1] : '';
        const succeedingCharacter = closingIndex !== -1 ? (this.contents[closingIndex + 2] || '') : '';
        const isHtmlInsertion = precedingCharacter === '>' || succeedingCharacter === '<';

        if (closingIndex !== -1 && isHtmlInsertion) {
          i = closingIndex + 1;
          continue;
        }
      }

      throw new Error(chalk.red('Reference cannot mix pipe syntax with {} or non-HTML {{}} syntax: ' + this.fullText + `\n${this.parserContext.currentFilePathAndLineNumber}`));
    }
  }

  findClosingDoubleBrace(startIndex) {
    for (let i = startIndex; i < this.contents.length - 1; i += 1) {
      if (this.contents[i] === '}' && this.contents[i + 1] === '}' && !this.characterIsEscaped(this.contents, i)) {
        return i;
      }
    }

    return -1;
  }

  characterIsEscaped(string, index) {
    let backslashCount = 0;

    for (let i = index - 1; i >= 0 && string[i] === '\\'; i -= 1) {
      backslashCount += 1;
    }

    return backslashCount % 2 === 1;
  }

  parseCurlyBraceReference() {
    const sanitizedContents = this.sanitizeLiteralHtmlBraces(this.contents);
    const regex = /(\{\{?)((?:(?!\}).)+)(\}\}?)|((?:\\.|[^{}])+)/gs;
    const segments = Array.from(sanitizedContents.matchAll(regex));

    segments.forEach((match) => {
      const [segment, openingBraces, braceContents, closingBraces, plainText] = match;
      const originalSegment = this.contents.slice(match.index, match.index + segment.length);

      if (plainText) {
        this.displayText += originalSegment; //{|The }Literature/Big Bad Wolf
        this.targetText += originalSegment;
      } else {
        this.validateBraces(openingBraces, closingBraces);

        if (openingBraces.length === 1) {
          this.handleSingleBrace(braceContents);
        } else if (openingBraces.length === 2) {
          this.handleDoubleBrace(braceContents);
        }
      }
    });

    this.displayText = this.exclusiveDisplaySyntax ? this.exclusiveDisplayText : 
      (this.exclusiveTargetSyntax ? this.displayText : this.findLastPathComponent(this.displayText)); // only {{}} is path if present

    this.targetText = this.exclusiveTargetSyntax ? this.exclusiveTargetText : this.targetText;
  }

  validateBraces(opening, closing) {
    if (opening.length !== closing.length) {
      throw new Error(chalk.red('Unbalanced curly braces in reference: ' + this.fullText + `\n${this.parserContext.currentFilePathAndLineNumber}`));
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
    if (this.contents.matchAll(/((?:\\.|[^\\])+?)\|/g).length > 1) {
      throw new Error(chalk.red('Reference has too many pipes: ' + this.fullText + `\n${this.parserContext.currentFilePathAndLineNumber}`));
    }
    const [_, target, display] = [...(this.contents.match(/((?:\\.|[^\\])+?)\|((?:\\.|[^\\])+?)$/)||[])];
    if (!target || !display) {
      throw new Error(chalk.red('Reference has empty pipe segment: ' + this.fullText + `\n${this.parserContext.currentFilePathAndLineNumber}`));
    }
    this.targetText = target;
    this.displayText = display;
  }

  get lastPathComponent() {
    if (this.singleTopicWithEmptyFragment) return Reference.textBeforeFragment(this.contents);
    if (this.soloPoundSign) return null;
    if (this.soloCaretSign) return null;
    if (this.soloPeriod) return null;
    // Regular expression to match the last unescaped slash or hash
    return this.findLastPathComponent(this.contents);
  }

  findLastPathComponent(string) {
    const match = string.match(/(?:^|[^\\< ]|\\\\+)([/#])([^/#]*(?:\\.[^/#]*)*)$/);
    if (match) {
      return match[2]; // Return text after the last unescaped slash or hash
    } else {
      return string;
    }
  }

  parseSimple() {
    this.targetText = this.contents;
    this.displayText = this.lastPathComponent;
    if (!this.displayText) {
      if (this.soloPoundSign) this.displayText = 'Top';
      else if (this.soloCaretSign || this.soloPeriod) this.displayText = 'Back';
    }
  }

  get isPath() {
    return !!this.targetText.match(/(^|[^\\])(\\\\)*[#/]/);
  }

  get simpleTarget() {
    return !this.isPath;
  }

  get targetAsTopic() {
    if (!this.simpleTarget) return null;
    return Topic.for(this.targetText);
  }

  get orphanFragment() {
    return !!this.targetText.match(/^#([^#/]*(?:\\.[^#/]*)*)$/);
  }

  get initialOrphanFragment() {
    return !!this.targetText.match(/^#([^#/]*)/);
  }

  get soloPoundSign() {
    return !!(this.targetText === '#');
  }

  get soloCaretSign() {
    return !!(this.targetText === '^');
  }

  get soloPeriod() {
    return !!(this.targetText === '.');
  }

  get singleTopicWithEmptyFragment() {
    return !!this.targetText.match(/^([^#/]*(?:\\.[^#/]*)*)#$/);
  }

  static textBeforeFragment(string) {
    const match = string.match(/^((?:\\.|[^/])+?)#/);
    return match ? match[1] : null;
  }

  static textAfterFragment(string) {
    const match = string.match(/^(?:\\.|[^/])*?#(.*)$/);
    return match ? match[1] : null;
  }

  static firstSegmentComponent(string) {
    return string.match(/^[^/#]*/)[0] || this.targetText;
  }

  get firstTopic() {
    return Topic.fromUrl(Reference.firstSegmentComponent(this.pathString));
  }

  get firstSubtopic() {
    let subtopicString = this.pathString.match(/^(?:\\.|[^/])+?#((?:\\.|[^/])+?)(?:\/.*)?$/)?.[1];
    subtopicString = subtopicString || this.firstTopic.mixedCase;
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
    return [...this.displayPathString.matchAll(/(?:\\.|[^\\/])+?(?:#(?:\\.|[^\\/])+?)?(?:(?=\/|$))/g)].map(match => match[0]).map(segmentString => {
      let [topic, subtopic] = segmentString.match(/((?:[^#/\\]|\\.)*)(?:[#]((?:[^#/\\]|\\.)*))?/).slice(1).map(m => m && Topic.fromReference(m));
      return (this.parserContext.getOriginalTopic(topic)||topic).url + // gives us original display version
        (subtopic ? ('#' + ((this.parserContext.getOriginalSubtopic(topic, subtopic)||subtopic).url)) : '');
    }).join('/');
  }

  get displayPathString() {
    if (this.soloPoundSign) { //eg [#], short for topic subtopic
      let enclosingTopicMixedCase = this.enclosingTopic.mixedCase.replace(/([^\\])\//g, '$1\\/');
      return `${enclosingTopicMixedCase}#${enclosingTopicMixedCase}`;
    }

    if (this.soloCaretSign) { //eg [^], short for parent paragraph
      let enclosingTopicMixedCase = this.enclosingTopic.mixedCase.replace(/([^\\])\//g, '$1\\/');
      if (this.parserContext.inTopicParagraph) return enclosingTopicMixedCase; // self-reference is pop in topic paragraph, parent unknown
      let parentSubtopic = this.parserContext.parentTopicOf(this.parserContext.currentSubtopic);
      if (!parentSubtopic) this.parserContext.registerSubsumptionConditionalError(`Cannot use [[^]] syntax for parent declared after reference in expl file: ` + this.fullText);
      return `${enclosingTopicMixedCase}#${parentSubtopic?.mixedCase}`;
    }

    if (this.soloPeriod) { // eg [[.]] meaning parent link in subtopic and pop in topic
      if (this.parserContext.inTopicParagraph) {
        return this.enclosingTopic.mixedCase;
      } else {
        return `${this.enclosingTopic.mixedCase}#${this.enclosingSubtopic.mixedCase}`;
      }
    }

    if (this.localReference) { // eg [[X]] where X is a subtopic of current topic
      return `${this.parserContext.currentTopic.mixedCase}#${this.targetText}`;
    }

    if (this.simpleGlobalReference) { // eg [[X]] where X is only global topic
      return this.targetText;
    }

    if (this.singleTopicWithEmptyFragment) { // eg [[A#]], global reference override for subtopic collision
    }

    if (this.orphanFragment) { // eg [[#A]], global self-reference to current topic and given subtopic
      return `${this.enclosingTopic.mixedCase}#${Reference.textAfterFragment(this.targetText)}`;
    }

    if (this.initialOrphanFragment) {
      return `${this.enclosingTopic.mixedCase}#${Reference.textAfterFragment(this.targetText)}`;
    }

    return this.targetText;
  }

  static candidateSubstring(string) { // eg '[[abc]] and then more text' -> '[[abc]]'
    return string.match(/^\[\[((?:\\.|[^\\])+?)\]\]/)?.[0] || '';
  }

  static for(string, parserContext) {
    return new Reference(string, parserContext);
  }
}

module.exports = Reference;
