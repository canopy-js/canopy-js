let Topic = require('../../shared/topic');
let dedent = require('dedent-js');
let Block = require('../../shared/block');
let { displaySegment } = require('../../shared/simple-helpers');
let chalk = require('chalk');

class ParserContext {
  constructor({ explFileData, defaultTopicString, priorParserContext, options }) {
    if (priorParserContext) {
      Object.assign(this, priorParserContext, options); // create a new object with new properties, but with references to prior data properties
    } else {
      this.subtopicLineNumbers = {}; // by topic, by subtopic, the line number of that subtopic
      this.topicSubtopics = {}; // by topic, by subtopic, topic objects for the name of that subtopic
      this.subtopicParents = {}; // by topic, by subtopic, the parent subtopic that contains a local reference to that subtopic
      this.subtopicParentReferences = {}; // by topic, by subtopic, the parent link reference string for the specified subtopic
      this.redundantLocalReferences = []; // a list of redundant local references with metadata to validate at the end of the second-pass
      this.ambiguousLocalReferences = []; // a list of local references that are possibly global/import and possibly redundant
      this.doubleDefinedSubtopics = []; // subtopics which are defined twice for later validation that they are subsumed and thus invalid
      this.subsumptionConditionalErrors = []; // this is a catch-all for errors that should be thrown if an enclosing subtopic is subsumed
      this.defaultTopic = new Topic(defaultTopicString); // the default topic of the project, used to log orphan topics not connected to it
      this.topicConnections = {}; // by topic, an object of other topics that that topic has outgoing global references to
      this.topicFilePaths = {}; // by topic, the file path where that topic is defined
      this.currentTopic = null; // the current topic file being parsed
      this.currentSubtopic = null; // the current subtopic paragraph being parsed
      this.pathsReferenced = []; // a list of paths referenced in global references to validate
      this.globalReferencesBySubtopic = {}; // for each topic#subtopic combo, what global references / path references exist?
      this.fragmentReferenceSubtopics = {}; // per topic, a list of subtopics added by fragment references

      this.lineNumber = 1; // the current line number being parsed
      this.characterNumber = 1; // the current line number being parsed
      this.linePrefixSize = 0; // The number of characters assumed to be on the line when we see a newline, eg '> ' for block quote

      this.buildNamespaceObject(explFileData);
      
      this.insideToken = false; // are we parsing tokens inside another token? We use this to avoid recognizing multi-line tokens inside other tokens.

      Object.assign(this, options); // add options if supplied at constructor time
    }
  }

  clone(options = {}) {
    return new ParserContext({ priorParserContext: this, options }); // reuse the data about the project but allow new properties on the instance
  }

  // This function does a first-pass over all the expl files of the project and creates several
  // indexes of that content which will be necessary for the more in-depth second pass performed in parseBlock
  buildNamespaceObject(explFileData) {
    let { topicSubtopics, topicFilePaths, subtopicLineNumbers, doubleDefinedSubtopics } = this;

    Object.keys(explFileData).forEach(function(filePath){
      let fileContents = explFileData[filePath];
      let paragraphsWithKeys = fileContents.split(/\n\n/);
      let topicParargaph = new Block(paragraphsWithKeys[0]);
      if (!topicParargaph.key) return;
      let currentTopic = new Topic(topicParargaph.key);
      let lineNumber = 1;

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

        let paragraph = new Block(paragraphText);
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

          if (currentSubtopic.display.trim() !== currentSubtopic.display) {
            throw new Error(chalk.red(`Error: Subtopic name [${currentSubtopic.display}] in topic [${currentTopic.display}] begins or ends with whitespace.\n\n${filePath}:${lineNumber}`));
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
    this.subtopicParentReferences[topic.caps] = this.subtopicParentReferences[topic.caps] || {};
    this.topicFilePaths[topic.caps] = this.filePath;
  }

  get inTopicParagraph() {
    return Topic.areEqual(this.currentTopic, this.currentSubtopic);
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
    if (num === 0) return this;
    if (num) {
      this.characterNumber += num;
    } else {
      this.characterNumber++;
    }
    return this;
  }

  incrementLineAndResetCharacterNumber(num) {
    if (num === 0) return this;
    this.characterNumber = 1 + this.linePrefixSize;
    if (num) {
      this.lineNumber += num;
    } else {
      this.lineNumber++;
    }
    return this;
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
    return this.topicSubtopics[givenTopic.caps]?.[givenTopic.caps];
  }

  getOriginalSubtopic(currentTopic, givenSubtopic) {
    if (!givenSubtopic) throw new Error('two arguments required');
    return this.topicSubtopics[currentTopic.caps]?.[givenSubtopic.caps];
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

  pathExists(path) {
    return path.array.reduce((segment) => {
      if (!segment) return false;

      if (this.topicSubtopics.hasOwnProperty(segment[0].caps) && this.topicSubtopics[segment[0].caps].hasOwnProperty(segment[1].caps)) {
        return true;
      } else {
        return false;
      }
    });
  }

  subtopicReferenceIsRedundant(targetSubtopic) {
    return this.subtopicParents[this.currentTopic.caps][targetSubtopic.caps];
  }

  registerPotentialRedundantLocalReference(targetSubtopic, secondReference) {
    this.redundantLocalReferences.push([
      this.subtopicParents[this.currentTopic.caps][targetSubtopic.caps],
      this.currentSubtopic,
      this.currentTopic,
      targetSubtopic,
      this.subtopicParentReferences[this.currentTopic.caps][targetSubtopic.caps],
      secondReference.fullText
    ]);
  }

  registerLocalReference(targetSubtopic, index, reference) {
    this.subtopicParents[this.currentTopic.caps][targetSubtopic.caps] = this.currentSubtopic;
    this.subtopicParentReferences[this.currentTopic.caps][targetSubtopic.caps] = reference.fullText;
  }

  registerFragmentReference(reference, currentSubtopic) {
    this.fragmentReferenceSubtopics[this.currentTopic.caps] = this.fragmentReferenceSubtopics[this.currentTopic.caps] || [];
    this.fragmentReferenceSubtopics[this.currentTopic.caps].push({
      fragmentTargetSubtopic: reference.targetAsTopic,
      enclosingSubtopic: currentSubtopic
    });
  }

  addFragmentReferenceSubtopics(callback) {
    if (this.fragmentReferenceSubtopics[this.currentTopic.caps]) {
      this.fragmentReferenceSubtopics[this.currentTopic.caps].forEach(({fragmentTargetSubtopic, enclosingSubtopic}) => {
        this.topicSubtopics[this.currentTopic.caps][fragmentTargetSubtopic.caps] = fragmentTargetSubtopic;
        this.subtopicParents[this.currentTopic.caps][fragmentTargetSubtopic.caps] = enclosingSubtopic;

        callback(fragmentTargetSubtopic); // caller will know how to add topics to json object
      });
    }
  }

  parentTopicOf(subtopic) {
    return this.subtopicParents[this.currentTopic.caps][subtopic.caps];
  }

  registerSubsumptionConditionalError(errorString) {
    this.subsumptionConditionalErrors.push({ // this is an error that should be thrown if the enclosing paragraph is subsumed
      enclosingTopic: this.currentTopic,
      enclosingSubtopic: this.currentSubtopic,
      errorString
    });
  }

  throwSubsumptionConditionalErrors() {
    this.subsumptionConditionalErrors.forEach(errorObject => {
      if (this.hasConnection(errorObject.enclosingSubtopic, errorObject.enclosingTopic, {}, true)) {
        throw new Error(chalk.red(errorObject.errorString));
      }
    });
  }

  get currentFilePathAndLineNumber() {
    return `${this.topicFilePaths[this.currentTopic.caps]}:${this.lineNumber}:${this.characterNumber}`;
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

  registerGlobalReference(pathString, reference, referenceString) {
    this.topicConnections[this.currentTopic.caps] = this.topicConnections[this.currentTopic.caps] || {};
    this.topicConnections[this.currentTopic.caps][reference.firstTopic.caps] = true;
    this.topicConnections[reference.firstTopic.caps] = this.topicConnections[reference.firstTopic.caps] || {};

    this.globalReferencesBySubtopic[this.currentTopic.caps] =
      this.globalReferencesBySubtopic[this.currentTopic.caps] || {};
    this.globalReferencesBySubtopic[this.currentTopic.caps][this.currentSubtopic.caps] =
      this.globalReferencesBySubtopic[this.currentTopic.caps][this.currentSubtopic.caps] || {};
    this.globalReferencesBySubtopic[this.currentTopic.caps][this.currentSubtopic.caps][reference.firstTopic.caps] = true;

    this.pathsReferenced.push([pathString, reference, this.currentFilePathAndLineNumber, referenceString, this.currentTopic, this.currentSubtopic]);
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

  validateRedundantLocalReferences() { // see if redundant local links are in paragraphs that ended up getting subsumed
    this.redundantLocalReferences.forEach(([enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic, reference1, reference2]) => { // are problematic links in separate real subsumed paragraphs? (You're allowed to have redundant local references in the same paragraph.)
      if (this.hasConnection(enclosingSubtopic1, topic) && this.hasConnection(enclosingSubtopic2, topic) && enclosingSubtopic1 !== enclosingSubtopic2) { // in same p allowed
        throw new Error(chalk.red(dedent`Error: Two local references exist in topic [${topic.mixedCase}] to subtopic [${referencedSubtopic.mixedCase}]

            One reference is ${reference1} in subtopic ${displaySegment(topic, enclosingSubtopic1)}
            ${this.topicFilePaths[topic.caps]}:${this.subtopicLineNumbers[topic.caps][enclosingSubtopic1.caps]}

            The other reference is ${reference2} in subtopic ${displaySegment(topic, enclosingSubtopic2)}
            ${this.topicFilePaths[topic.caps]}:${this.subtopicLineNumbers[topic.caps][enclosingSubtopic2.caps]}

            Multiple local references to the same subtopic are not permitted.

            Consider making one of these local references a self path reference.
            That would look like using [[#${referencedSubtopic.mixedCase}]].
            `));
      }
    });
  }

  validateGlobalReferences() {
    this.pathsReferenced.forEach(([pathString, reference, pathAndLineNumberString, referenceString, enclosingTopic, enclosingSubtopic]) => {
      if (this.hasConnection(enclosingSubtopic, enclosingTopic)) {
        [...pathString.matchAll(/(?:\\.|[^/])+/g)].map(match => match[0]).map(segmentString => {
          let [currentTopic, currentSubtopic] = Topic.parseUrlSegment(segmentString);

          if (!this.topicExists(currentTopic)) {
            let punctuationWarning = currentTopic.mixedCase.match(/[.,:;]/) ? '\nWarning: Using punctuation like [.,;:] terminates a paragraph key.' : '';
            throw new Error(chalk.red(`Error: Reference "${referenceString}" in subtopic [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] mentions nonexistent topic or subtopic [${currentTopic.mixedCase}].\n${pathAndLineNumberString}` + punctuationWarning));
          }

          if (currentSubtopic && !this.topicHasSubtopic(currentTopic, currentSubtopic)) {
            throw new Error(chalk.red(`Error: Subtopic [${currentTopic.mixedCase}, ${currentSubtopic.mixedCase}] referenced in reference "${referenceString}" of paragraph [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] does not exist.\n${pathAndLineNumberString}`));
          }

          if (!this.cache && !this.hasConnection(currentSubtopic || currentTopic, currentTopic)) {
            throw new Error(chalk.red(`Error: Subtopic [${currentTopic.mixedCase}, ${reference.firstSubtopic.mixedCase}] referenced in reference "${referenceString}" of paragraph [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] exists but is not subsumed by given topic.\n${pathAndLineNumberString}`));
          }

          return segmentString;
        }).reduce((currentSegmentString, nextSegmentString) => {
          let [_, currentTopic, currentSubtopic] = currentSegmentString.match(/^((?:\\.|[^\\])+?)(?:#(.*))?$/).map(m => m && Topic.fromUrl(m));
          let [__, nextTopic] = nextSegmentString.match(/^((?:\\.|[^\\])+?)(?:#(.*))?$/).map(m => m && Topic.fromUrl(m));

          if (!this.cache && !this.globalReferencesBySubtopic[currentTopic.caps]?.[(currentSubtopic||currentTopic).caps]?.[nextTopic.caps]) {
            throw new Error(chalk.red(`Error: Global reference "${referenceString}" contains invalid adjacency:\n` +
             `[${currentTopic.mixedCase}, ${(currentSubtopic||currentTopic).mixedCase}] does not reference [${nextTopic.mixedCase}]\n`+
             `${pathAndLineNumberString}`));
          }

          return nextSegmentString;
        });
      }
    });
  }

  hasConnection(subtopic, topic, visitedSubtopics = {}) { // Does a given subtopic have a local-reference path to the given topic?
    if (subtopic.caps === topic.caps) return true;
    if (this.subtopicParents[topic.caps] === null) return true; // we will proceed assuming there is a connection because this is a cache run
    if (this.subtopicParents[topic.caps] && !this.subtopicParents[topic.caps][subtopic.caps]) return false;
    if (!this.subtopicParents.hasOwnProperty(topic.caps)) return false; // there were no local references in that topic
    if (!this.subtopicParents[topic.caps].hasOwnProperty(subtopic.caps)) return false; // no one ever referenced the subtopic
    if (visitedSubtopics[subtopic.caps]) return false; // ignore the cycle and allow other paths to continue
    visitedSubtopics[subtopic.caps] = true;
    return this.hasConnection(this.subtopicParents[topic.caps][subtopic.caps], topic, visitedSubtopics);
  }
}

module.exports = ParserContext;
