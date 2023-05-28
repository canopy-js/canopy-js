let Topic = require('../../shared/topic');
let { LinkProximityCalculator, terminalCategoryofPath, isCategoryNotesFile, topicKeyOfString } = require('./helpers');
let dedent = require('dedent-js');
let { ImportReferenceToken } = require('./tokens');
let Paragraph = require('../../shared/paragraph');
let { displaySegment } = require('../../shared/helpers');
let chalk = require('chalk');

class ParserContext {
  constructor({ explFileData, defaultTopicString, priorParserContext, options }) {
    if (priorParserContext) {
      Object.assign(this, priorParserContext, options) // create a new object with new properties, but with references to prior data properties
    } else {
      this.subtopicLineNumbers = {}; // by topic, by subtopic, the line number of that subtopic
      this.topicSubtopics = {}; // by topic, by subtopic, topic objects for the name of that subtopic
      this.subtopicParents = {}; // by topic, by subtopic, the parent subtopic that contains a local reference to that subtopic
      this.subtopicsOfGlobalReferences = {}; // by topic, by target topic, the subtopic of topic that contains the global reference to target topic
      this.importReferencesToCheck = []; // a list of import references with metadata to validate at the end of the second-pass
      this.redundantLocalReferences = []; // a list of redundant local references with metadata to validate at the end of the second-pass
      this.provisionalLocalReferences = {}; // a list of local reference tokens for conversion to import if later found to be redundant
      this.doubleDefinedSubtopics = []; // subtopics which are defined twice for later validation that they are subsumed and thus invalid
      this.defaultTopic = new Topic(defaultTopicString); // the default topic of the project, used to log orphan topics not connected to it
      this.topicConnections = {}; // by topic, an object of other topics that that topic has outgoing global references to
      this.topicFilePaths = {}; // by topic, the file path where that topic is defined
      this.currentTopic = null; // the current topic file being parsed
      this.currentSubtopic = null; // the current subtopic paragraph being parsed

      this.lineNumber = 1; // the current line number being parsed
      this.characterNumber = 1; // the current line number being parsed
      this.linePrefixSize = 0;
      this.buildNamespaceObject(explFileData);

      this.preserveNewlines = false; // should text tokens preserve newlines?
      this.insideToken = false; // are we parsing tokens inside another token? We use this to avoid recognizing multi-line tokens inside other tokens.
    }
  }

  clone(options) {
    return new ParserContext({ priorParserContext: this, options }); // reuse the data about the project but allow new properties on the instance
  }

  // This function does a first-pass over all the expl files of the project and creates several
  // indexes of that content which will be necessary for the more in-depth second pass performed in parseParagraph

  buildNamespaceObject(explFileData) {
    let { topicSubtopics, topicFilePaths, subtopicLineNumbers, doubleDefinedSubtopics } = this;
    Object.keys(explFileData).forEach(function(filePath){
      let fileContents = explFileData[filePath];
      let paragraphsWithKeys = fileContents.split(/\n\n/);
      let topicParargaph = new Paragraph(paragraphsWithKeys[0]);
      if (!topicParargaph.key) return;
      let currentTopic = new Topic(topicParargaph.key);
      let lineNumber = 1;

      if (isCategoryNotesFile(filePath) && // disregard keys in category notes if the root topic doesn't match filename
        topicKeyOfString(explFileData[filePath]) !== Topic.convertUnderscoresToSpaces(terminalCategoryofPath(filePath))) {
        return;
      }

      if (topicSubtopics.hasOwnProperty(currentTopic.caps)) {
        throw new Error(chalk.red(dedent`Error: Topic or similar appears twice in project: [${currentTopic.mixedCase}]
        - One file is: ${topicFilePaths[currentTopic.caps]}
        - Another file is: ${filePath}
        `));
      } else {
        topicFilePaths[currentTopic.caps] = filePath;
      }

      if (currentTopic.display.trim() !== currentTopic.display) {
        throw new Error(chalk.red(`Error: Topic name [${currentTopic.display}] begins or ends with whitespace.\n` + filePath));
      }

      topicSubtopics[currentTopic.caps] = {};

      paragraphsWithKeys.forEach(function(paragraphText) {
        if (paragraphText[0] === "\n") { // because we split on \n\n, there is only a chance that the first character is a newline
          lineNumber++;
          paragraphText = paragraphText.slice(1);
        }

        let paragraph = new Paragraph(paragraphText);
        if (paragraph.key) {
          let currentSubtopic = new Topic(paragraph.key);

          if (topicSubtopics[currentTopic.caps].hasOwnProperty(currentSubtopic.caps)) {
            doubleDefinedSubtopics.push(
              [
                currentTopic,
                currentSubtopic,
                filePath,
                subtopicLineNumbers[currentTopic.caps][currentSubtopic.caps],
                lineNumber
              ]
            );
          }

          topicSubtopics[currentTopic.caps][currentSubtopic.caps] = currentSubtopic;
          subtopicLineNumbers[currentTopic.caps] = subtopicLineNumbers[currentTopic.caps] || {};
          subtopicLineNumbers[currentTopic.caps][currentSubtopic.caps] = lineNumber;
        }

        lineNumber += paragraphText.split("\n").length + 1; // length of paragraph plus additional newline separating paragraphs
      });
    });

    return topicSubtopics;
  }

  setLineNumberToCurrentSubtopic() {
    this.lineNumber = this.subtopicLineNumbers[this.currentTopic.caps][this.currentSubtopic.caps];
    this.characterNumber = 1;
  }

  setTopicAndSubtopic(topic, subtopic) {
    this.currentTopic = topic;
    this.currentSubtopic = subtopic;
    this.subtopicParents[this.currentTopic.caps] = this.subtopicParents[this.currentTopic.caps] || {};
    this.topicFilePaths[topic.caps] = this.filePath;
    this.subtopicsOfGlobalReferences[topic.caps] = this.subtopicsOfGlobalReferences[topic.caps] || {};
  }

  get currentTopicAndSubtopic() {
    return {
      currentTopic: this.currentTopic,
      currentSubtopic: this.currentSubtopic
    };
  }

  set currentText(text) {
    this.text = text;
  }

  set currentTokens(tokens) {
    this.tokens = tokens;
  }

  get currentText() {
    return this.text;
  }

  get currentTokens() {
    return this.tokens;
  }

  resetCharacterNumber() {
    this.characterNumber = 1 + this.linePrefixSize;
  }

  incrementCharacterNumber(num) {
    if (num === 0) return;
    if (num) {
      this.characterNumber += num;
    } else {
      this.characterNumber++;
    }
  }

  incrementLineNumber(num) {
    if (num === 0) return;
    this.characterNumber = 1 + this.linePrefixSize;
    if (num) {
      this.lineNumber += num;
    } else {
      this.lineNumber++;
    }
  }

  get filePathAndLineNumber() {
    return `${this.topicFilePaths[this.currentTopic.caps]}:${this.lineNumber}:${this.characterNumber}`;
  }

  set filePath(filePath) {
    this.filePathString = filePath;
  }

  get filePath() {
    return this.filePathString;
  }

  getOriginalTopic(givenTopic) {
    return this.topicSubtopics[givenTopic.caps][givenTopic.caps];
  }

  getOriginalSubTopic(currentTopic, givenSubtopic) {
    if (!givenSubtopic) throw new Error('two arguments required');
    return this.topicSubtopics[currentTopic.caps][givenSubtopic.caps];
  }

  currentTopicHasSubtopic(targetSubtopic) {
    return this.topicSubtopics[this.currentTopic.caps].hasOwnProperty(targetSubtopic.caps);
  }

  topicHasSubtopic(topic, subtopic) {
    return this.topicSubtopics[topic.caps]?.hasOwnProperty(subtopic.caps);
  }

  topicExists(topic) {
    return this.topicSubtopics.hasOwnProperty(topic.caps);
  }

  subtopicReferenceIsRedundant(targetSubtopic) {
    return this.subtopicParents[this.currentTopic.caps][targetSubtopic.caps];
  }

  provisionalLocalReference(targetSubtopic) {
    return this.provisionalLocalReferences[targetSubtopic.caps];
  }

  registerPotentialRedundantLocalReference(targetSubtopic) {
    this.redundantLocalReferences.push([
      this.subtopicParents[this.currentTopic.caps][targetSubtopic.caps],
      this.currentSubtopic,
      this.currentTopic,
      targetSubtopic
    ]);
  }

  registerLocalReference(targetSubtopic, index, linkText, token) {
    this.subtopicParents[this.currentTopic.caps][targetSubtopic.caps] = this.currentSubtopic;

    this.provisionalLocalReferences[targetSubtopic.caps] = { // local references to convert to imports if found redundant
      token,
      paragraphText: this.paragraphText,
      index,
      enclosingTopic: this.currentTopic,
      enclosingSubtopic: this.currentSubtopic,
      linkText,
      filePath: this.filePath,
      lineNumber: this.lineNumber
    };
  }

  findImportReferenceTargetTopic(targetSubtopic, paragraphText, parserContext) {
    let linksOfParagraph = Array.from(
      paragraphText.matchAll(/\[\[((?:(?!(?<!\\)\]\]).)+)\]\]/g) // [[ followed by any number of not-unescaped-]], followed by ]]
    ).map(match => match[1]);

    let targetTopicCandidates = linksOfParagraph.map(string => new Topic(string)).filter(topic => {
      return this.topicHasSubtopic(topic, targetSubtopic);
    });

    if (targetTopicCandidates.length > 1) throw new Error(chalk.red(
      `Import reference [${targetSubtopic.mixedCase}] could belong to multiple global references: ` +
      `[${targetTopicCandidates.map(t => t.mixedCase).join(', ')}].\n` +
      `Please use explicit import syntax eg [[${targetTopicCandidates[0].slug}#${targetSubtopic.mixedCase}]]\n`
      + `${parserContext.filePathAndLineNumber}`
    ))

    return targetTopicCandidates[0];
  }

  localReferenceCouldBeImport(targetSubtopic, parserContext) {
    return !!this.findImportReferenceTargetTopic(targetSubtopic, parserContext.paragraphText, parserContext);
  }

  priorLocalReferenceCouldBeImport(targetSubtopic, parserContext) {
    let {
      paragraphText,
      index
    } = this.provisionalLocalReferences[targetSubtopic.caps];

    return !!this.findImportReferenceTargetTopic(targetSubtopic, paragraphText, parserContext);
  }

  convertPriorLocalReferenceToImport(targetSubtopic, parserContext) {
    let {
      token,
      paragraphText,
      index,
      enclosingTopic,
      enclosingSubtopic,
      linkText
    } = this.provisionalLocalReferences[targetSubtopic.caps];

    let targetTopic = this.findImportReferenceTargetTopic(targetSubtopic, paragraphText, parserContext);

    token.type = 'import';
    token.targetTopic = targetTopic.mixedCase;
    token.targetSubtopic = this.getOriginalSubTopic(targetTopic, targetSubtopic).mixedCase;
    token.enclosingTopic = enclosingTopic.mixedCase;
    token.enclosingSubtopic = enclosingSubtopic.mixedCase;
    token.text = linkText;
    token.constructor = ImportReferenceToken;
  }

  registerImportReference(enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic) {
    this.importReferencesToCheck.push({
      enclosingTopic,
      enclosingSubtopic,
      targetTopic,
      targetSubtopic,
      paragraphReferences: this.paragraphReferences,
      filePath: this.filePath,
      lineNumber: this.lineNumber
    });
  }

  validateImportReferenceGlobalMatching() { // every import reference must have a global reference to the target subtopic's topic in the same paragraph
    this.importReferencesToCheck.forEach(({enclosingTopic, enclosingSubtopic, paragraphReferences, filePath, lineNumber}) => {
      paragraphReferences.filter(t => t.type === 'import').forEach(importReferenceToken => {
        let globalToken = paragraphReferences.find(
          token =>
            token.type === 'global' &&
            token.targetTopic === importReferenceToken.targetTopic &&
            token.targetSubtopic === importReferenceToken.targetTopic
        );

        if(!globalToken) {
          let targetTopic = new Topic(importReferenceToken.targetTopic);
          let targetSubTopic = new Topic(importReferenceToken.targetSubtopic);
          let originalTargetTopic = this.getOriginalTopic(targetTopic);
          let originalTargetSubtopic = this.getOriginalSubTopic(targetTopic, targetSubTopic);
          throw new Error(chalk.red(`Error: Import reference to ${displaySegment(originalTargetTopic.mixedCase, originalTargetSubtopic.mixedCase)} in ${displaySegment(enclosingTopic.mixedCase, enclosingSubtopic.mixedCase)} lacks global reference to topic [${originalTargetTopic.mixedCase}].\n` +
            `${filePath}:${lineNumber}\n`));
        }
      });
    });
  }

  validateImportReferenceTargets() { // every import reference must point at a subtopic that actually exists in the target topic
    this.importReferencesToCheck.forEach(({enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic, filePath, lineNumber}) => {
      if (!this.hasConnection(targetSubtopic, targetTopic)) {
        throw new Error(chalk.red(`Error: Import reference in ${displaySegment(enclosingTopic.mixedCase, enclosingSubtopic.mixedCase)} is referring to unsubsumed subtopic ${displaySegment(targetTopic.mixedCase, targetSubtopic.mixedCase)}\n` +
          `${filePath}:${lineNumber}\n`));
      }
    });
  }

  validateSubtopicDefinitions() {
    this.doubleDefinedSubtopics.forEach(([topic, subtopic, filePath, lineNumber1, lineNumber2]) => {
      if (this.subtopicParents[topic.caps]?.hasOwnProperty(subtopic.caps)) { // if the double defined subtopic gets subsumed and is accessible, it is invalid data
        throw new Error(chalk.red(`Error: Subtopic [${subtopic.mixedCase}] or similar appears twice in topic: [${topic.mixedCase}]\n` +
          `First definition: ${filePath}:${lineNumber1}\n` +
          `Second definition: ${filePath}:${lineNumber2}`));
      }
    });
  }

  registerGlobalReference(targetTopic, currentTopic, currentSubtopic) {
    this.topicConnections[currentTopic.caps] = this.topicConnections[currentTopic.caps] || {};
    this.topicConnections[currentTopic.caps][targetTopic.caps] = true;
    this.topicConnections[targetTopic.caps] = this.topicConnections[targetTopic.caps] || {};
    this.subtopicsOfGlobalReferences[currentTopic.caps][targetTopic.caps] = currentSubtopic;
  }

  logGlobalOrphans() {
    this.connectedTopics = {};
    this.registerConnectedTopic(this.defaultTopic.caps);
    Object.keys(this.topicSubtopics).forEach(topicCapsString => {
      let topic = this.topicSubtopics[topicCapsString][topicCapsString];
      if (!this.connectedTopics[topic.caps]) {
        console.log(chalk.magenta(
          `Warning: Global Orphan\n` +
          `Topic [${topic.mixedCase}] is not connected to the default topic [${this.defaultTopic.mixedCase}]\n` +
          `${this.topicFilePaths[topic.caps]}\n`
        ));
      }
    });
  }

  registerConnectedTopic(givenTopicCapsString) {
    if (!this.connectedTopics[givenTopicCapsString]) {
      this.connectedTopics[givenTopicCapsString] = true;
      Object.keys(this.topicConnections[givenTopicCapsString] || {}).forEach(targetTopicCapsString => this.registerConnectedTopic(targetTopicCapsString));
    }
  }

  logLocalOrphans() {
    Object.keys(this.subtopicParents).forEach(topicCapsString => {
      let topic = this.topicSubtopics[topicCapsString][topicCapsString];
      Object.keys(this.topicSubtopics[topicCapsString]).forEach(subtopicCapsString => {
        let subtopic = this.topicSubtopics[topicCapsString][subtopicCapsString];
        if (!this.hasConnection(subtopic, topic)) {
          console.log(chalk.magenta(`Warning: Local Orphan\n` +
            `Subtopic [${subtopic.mixedCase}] lacks a connection to its topic [${topic.mixedCase}]\n` +
            `${this.topicFilePaths[topic.caps]}:${this.subtopicLineNumbers[topic.caps][subtopic.caps]}\n`
          ));
        }
      });
    });
  }

  logNonReciprocals() {
    Object.keys(this.topicConnections).forEach((currentTopicCaps, i) => {
      Object.keys(this.topicConnections[currentTopicCaps]).forEach((targetTopicCaps, i) => {
        if (!this.topicConnections[targetTopicCaps] || !this.topicConnections[targetTopicCaps][currentTopicCaps]) {
          let currentSubtopic = this.subtopicsOfGlobalReferences[currentTopicCaps][targetTopicCaps];
          let currentTopic = this.topicSubtopics[currentTopicCaps][currentTopicCaps];
          let targetTopic = this.topicSubtopics[targetTopicCaps][targetTopicCaps];
          console.log(chalk.magenta(
            `Warning: Nonreciprocal Global Reference\n` +
            `Global reference in ${displaySegment(currentTopic.mixedCase, currentSubtopic.mixedCase)} exists to topic [${targetTopic.mixedCase}] with no reciprocal reference.\n` +
            `${this.topicFilePaths[currentTopic.caps]}:${this.subtopicLineNumbers[currentTopic.caps][currentSubtopic.caps]}\n` +
            `Try creating a global reference from [${targetTopic.mixedCase}] to [${currentTopic.mixedCase}]\n` +
            `${this.topicFilePaths[targetTopic.caps]}\n`
          ));
        }
      });
    });
  }

  validateRedundantLocalReferences() { // can only be done after we've seen every local reference
    this.redundantLocalReferences.forEach(([enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic]) => { // are problematic links in separate real subsumed paragraphs?
      if (this.hasConnection(enclosingSubtopic1, topic) && this.hasConnection(enclosingSubtopic2, topic) && enclosingSubtopic1 !== enclosingSubtopic2) {
        throw new Error(chalk.red(dedent`Error: Two local references exist in topic [${topic.mixedCase}] to subtopic [${referencedSubtopic.mixedCase}]

            - One reference is in ${displaySegment(topic.mixedCase, enclosingSubtopic1.mixedCase)} - ${this.topicFilePaths[topic.caps]}:${this.subtopicLineNumbers[topic.caps][enclosingSubtopic1.caps]}
            - One reference is in ${displaySegment(topic.mixedCase, enclosingSubtopic2.mixedCase)} - ${this.topicFilePaths[topic.caps]}:${this.subtopicLineNumbers[topic.caps][enclosingSubtopic2.caps]}

            Multiple local references to the same subtopic are not permitted.
            Consider making one of these local references a self-import reference.
            That would look like using [[${topic.mixedCase}#${referencedSubtopic.mixedCase}]] in the same paragraph as
            a reference to [[${topic.mixedCase}]].

            (It is also possible you meant one of these as an import reference, however,
            if both links could be either local or import references, you must clarify
            which is the import reference using explicit import syntax ie [[Other Topic#${referencedSubtopic.mixedCase}]])
            `));
      }
    });
  }

  hasConnection(subtopic, topic, visitedSubtopics = {}) { // Does a given subtopic have a local-reference path to the given topic?
    if (subtopic.caps === topic.caps) return true;
    if (this.subtopicParents[topic.caps] && !this.subtopicParents[topic.caps][subtopic.caps]) return false;
    if (!this.subtopicParents.hasOwnProperty(topic.caps)) return false; // there were no local references in that topic
    if (!this.subtopicParents[topic.caps].hasOwnProperty(subtopic.caps)) return false; // no one ever referenced the subtopic
    if (visitedSubtopics[subtopic.caps]) return false; // ignore the cycle and allow other paths to continue
    visitedSubtopics[subtopic.caps] = true;
    return this.hasConnection(this.subtopicParents[topic.caps][subtopic.caps], topic, visitedSubtopics);
  }
}

module.exports = ParserContext;
