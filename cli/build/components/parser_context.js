let Topic = require('../../shared/topic');
let dedent = require('dedent-js');
let Block = require('../../shared/block');
let { displaySegment } = require('../../shared/simple-helpers');
let chalk = require('chalk');

class ParserContext {
  constructor({ explFileObjectsByPath = {}, defaultTopicString, priorParserContext, options }) {
    if (priorParserContext) {
      Object.assign(this, priorParserContext, options); // create a new object with new properties, but with references to prior data properties
    } else {
      this.subtopicLineNumbers = {}; // by topic, by subtopic, the line number of that subtopic
      this.topicSubtopics = {}; // by topic, by subtopic, topic objects for the name of that subtopic
      this.localReferences = {}; // by topic, by target subtopic, { parentSubtopic, referenceText, location: { line, col } }
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

      this.buildNamespaceObject(explFileObjectsByPath);
      this.explFileObjectsByPath = explFileObjectsByPath; // retain contents for contextual error messages

      this.insideToken = false; // are we parsing tokens inside another token? We use this to avoid recognizing multi-line tokens inside other tokens.

      Object.assign(this, options); // add options if supplied at constructor time
    }
  }

  clone(options = {}) {
    return new ParserContext({ priorParserContext: this, options }); // reuse the data about the project but allow new properties on the instance
  }

  // This function does a first-pass over all the expl files of the project and creates several
  // indexes of that content which will be necessary for the more in-depth second pass performed in parseBlock
  buildNamespaceObject(explFileObjectsByPath) {
    let { topicSubtopics, topicFilePaths, subtopicLineNumbers, doubleDefinedSubtopics } = this;

    Object.keys(explFileObjectsByPath).forEach((filePath) => {
      let fileContents = explFileObjectsByPath[filePath]?.contents;
      let paragraphsWithKeys = fileContents.split(/\n\n/);
      let topicParargaph = new Block(paragraphsWithKeys[0]);
      if (!topicParargaph.key) return;
      let currentTopic = new Topic(topicParargaph.key);
      let lineNumber = 1;

      if (topicSubtopics.hasOwnProperty(currentTopic.caps)) {
        let message = dedent`Error: Topic or similar appears twice in project: [${currentTopic.mixedCase}]
        - One file is: ${topicFilePaths[currentTopic.caps]}
        - Another file is: ${filePath}
        `;
        throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, 1, 1)));
      } else {
        topicFilePaths[currentTopic.caps] = filePath;
      }

      if (currentTopic.display.trim() !== currentTopic.display) {
        let message = `Error: Topic name [${currentTopic.display}] begins or ends with whitespace.\n` + filePath;
        throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, 1, 1)));
      }

      topicSubtopics[currentTopic.caps] = {};

      paragraphsWithKeys.forEach((paragraphText) => {
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
            let message = `Error: Subtopic name [${currentSubtopic.display}] in topic [${currentTopic.display}] begins or ends with whitespace.\n\n${filePath}:${lineNumber}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, lineNumber, 1)));
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
    this.localReferences[this.currentTopic.caps] = this.localReferences[this.currentTopic.caps] || {};
    this.topicFilePaths[topic.caps] = this.filePath;
  }

  get inTopicParagraph() {
    return this.currentTopic.equals(this.currentSubtopic);
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
    return this.localReferences[this.currentTopic.caps]?.[targetSubtopic.caps]?.parentSubtopic;
  }

  registerPotentialRedundantLocalReference(targetSubtopic, secondReference) {
    let firstLocation = this.localReferences[this.currentTopic.caps]?.[targetSubtopic.caps]?.location;
    let secondLocation = { line: this.lineNumber, col: this.characterNumber };
    this.redundantLocalReferences.push([
      this.localReferences[this.currentTopic.caps]?.[targetSubtopic.caps]?.parentSubtopic,
      this.currentSubtopic,
      this.currentTopic,
      targetSubtopic,
      this.localReferences[this.currentTopic.caps]?.[targetSubtopic.caps]?.referenceText,
      secondReference.fullText,
      firstLocation,
      secondLocation
    ]);
  }

  registerLocalReference(targetSubtopic, index, reference) {
    this.localReferences[this.currentTopic.caps] = this.localReferences[this.currentTopic.caps] || {};
    this.localReferences[this.currentTopic.caps][targetSubtopic.caps] = {
      parentSubtopic: this.currentSubtopic,
      referenceText: reference.fullText,
      location: { line: this.lineNumber, col: this.characterNumber }
    };
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
        this.localReferences[this.currentTopic.caps] = this.localReferences[this.currentTopic.caps] || {};
        this.localReferences[this.currentTopic.caps][fragmentTargetSubtopic.caps] = {
          parentSubtopic: enclosingSubtopic,
          referenceText: null,
          location: null
        };

        callback(fragmentTargetSubtopic); // caller will know how to add topics to json object
      });
    }
  }

  parentTopicOf(subtopic) {
    return this.localReferences[this.currentTopic.caps]?.[subtopic.caps]?.parentSubtopic;
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
        let path = this.topicFilePaths[errorObject.enclosingTopic.caps];
        let line = this.subtopicLineNumbers[errorObject.enclosingTopic.caps]?.[errorObject.enclosingSubtopic.caps];
        throw new Error(chalk.red(this.formatErrorWithContext(errorObject.errorString, path, line, 1)));
      }
    });
  }

  get currentFilePathAndLineNumber() {
    return `${this.topicFilePaths[this.currentTopic.caps]}:${this.lineNumber}:${this.characterNumber}`;
  }

  validateSubtopicDefinitions() {
    this.doubleDefinedSubtopics.forEach(([topic, subtopic, filePath, lineNumber1, lineNumber2]) => {
      if (this.localReferences[topic.caps]?.hasOwnProperty(subtopic.caps)) { // if the double defined subtopic gets subsumed and is accessible, it is invalid data
        let message = `Error: Subtopic [${subtopic.mixedCase}] or similar appears twice in topic: [${topic.mixedCase}]\n` +
          `First definition: ${filePath}:${lineNumber1}\n` +
          `Second definition: ${filePath}:${lineNumber2}`;
        throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, lineNumber1, 1)));
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
    Object.keys(this.localReferences).forEach(topicCapsString => {
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
    this.redundantLocalReferences.forEach(([enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic, reference1, reference2, referenceLocation1, referenceLocation2]) => { // are problematic links in separate real subsumed paragraphs? (You're allowed to have redundant local references in the same paragraph.)
      if (this.hasConnection(enclosingSubtopic1, topic) && this.hasConnection(enclosingSubtopic2, topic) && enclosingSubtopic1 !== enclosingSubtopic2) { // in same p allowed
        let defaultLine1 = this.subtopicLineNumbers[topic.caps][enclosingSubtopic1.caps];
        let defaultLine2 = this.subtopicLineNumbers[topic.caps][enclosingSubtopic2.caps];
        let line1 = referenceLocation1?.line || defaultLine1;
        let line2 = referenceLocation2?.line || defaultLine2;
        let col1 = referenceLocation1?.col || 1;
        let col2 = referenceLocation2?.col || 1;
        let filePath = this.topicFilePaths[topic.caps];
        let referencePath1 = `${filePath}:${line1}${referenceLocation1?.col ? `:${col1}` : ''}`;
        let referencePath2 = `${filePath}:${line2}${referenceLocation2?.col ? `:${col2}` : ''}`;
        let message = dedent`Error: Two local references exist in topic [${topic.mixedCase}] to subtopic [${referencedSubtopic.mixedCase}]

            One reference is ${reference1} in subtopic ${displaySegment(topic, enclosingSubtopic1)}
            ${referencePath1}

            The other reference is ${reference2} in subtopic ${displaySegment(topic, enclosingSubtopic2)}
            ${referencePath2}

            Multiple local references to the same subtopic are not permitted.

            Consider making one of these local references a self path reference.
            That would look like using [[#${referencedSubtopic.mixedCase}]].
            `;
        throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, line1, col1)));
      }
    });
  }

  validateGlobalReferences() {
    this.pathsReferenced.forEach(([pathString, reference, pathAndLineNumberString, referenceString, enclosingTopic, enclosingSubtopic]) => {
      if (this.hasConnection(enclosingSubtopic, enclosingTopic)) {
        [...pathString.matchAll(/(?:\\.|[^/])+/g)].map(match => match[0]).map(segmentString => {
          let [currentTopic, currentSubtopic] = Topic.parseUrlSegment(segmentString);

          if (!this.topicExists(currentTopic)) {
            let punctuationWarning = currentTopic.mixedCase.match(/[.,:;]/) ? '\nWarning: Using punctuation like [.,;:] can terminate a paragraph key.' : '';
            let message = `Error: Reference ${referenceString} in subtopic [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] mentions nonexistent topic or subtopic [${currentTopic.mixedCase}].\n${pathAndLineNumberString}` + punctuationWarning;
            throw new Error(chalk.red(this.formatErrorWithContext(message, this.topicFilePaths[enclosingTopic.caps], this.lineNumber, this.characterNumber)));
          }

          if (currentSubtopic && !this.topicHasSubtopic(currentTopic, currentSubtopic)) {
            let message = `Error: Subtopic [${currentTopic.mixedCase}, ${currentSubtopic.mixedCase}] referenced in reference ${referenceString} of paragraph [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] does not exist.\n${pathAndLineNumberString}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, this.topicFilePaths[enclosingTopic.caps], this.lineNumber, this.characterNumber)));
          }

          if (!this.cache && !this.hasConnection(currentSubtopic || currentTopic, currentTopic)) {
            let message = `Error: Subtopic [${currentTopic.mixedCase}, ${reference.firstSubtopic.mixedCase}] referenced in reference ${referenceString} of paragraph [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] exists but is not subsumed by given topic.\n${pathAndLineNumberString}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, this.topicFilePaths[enclosingTopic.caps], this.lineNumber, this.characterNumber)));
          }

          return segmentString;
        }).reduce((currentSegmentString, nextSegmentString) => {
          let [_, currentTopic, currentSubtopic] = currentSegmentString.match(/^((?:\\.|[^\\])+?)(?:#(.*))?$/).map(m => m && Topic.fromUrl(m));
          let [__, nextTopic] = nextSegmentString.match(/^((?:\\.|[^\\])+?)(?:#(.*))?$/).map(m => m && Topic.fromUrl(m));

          if (!this.cache && !this.globalReferencesBySubtopic[currentTopic.caps]?.[(currentSubtopic||currentTopic).caps]?.[nextTopic.caps]) {
            let message = `Error: Global reference "${referenceString}" contains invalid adjacency:\n` +
             `[${currentTopic.mixedCase}, ${(currentSubtopic||currentTopic).mixedCase}] does not reference [${nextTopic.mixedCase}]\n`+
             `${pathAndLineNumberString}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, this.topicFilePaths[currentTopic.caps], this.lineNumber, this.characterNumber)));
          }

          return nextSegmentString;
        });
      }
    });
  }

  hasConnection(subtopic, topic, visitedSubtopics = {}) { // Does a given subtopic have a local-reference path to the given topic?
    if (subtopic.caps === topic.caps) return true;
    if (this.localReferences[topic.caps] === null) return true; // we will proceed assuming there is a connection because this is a cache run
    if (this.localReferences[topic.caps] && !this.localReferences[topic.caps][subtopic.caps]) return false;
    if (!this.localReferences.hasOwnProperty(topic.caps)) return false; // there were no local references in that topic
    if (!this.localReferences[topic.caps].hasOwnProperty(subtopic.caps)) return false; // no one ever referenced the subtopic
    if (visitedSubtopics[subtopic.caps]) return false; // ignore the cycle and allow other paths to continue
    visitedSubtopics[subtopic.caps] = true;
    return this.hasConnection(this.localReferences[topic.caps][subtopic.caps].parentSubtopic, topic, visitedSubtopics);
  }

  formatErrorWithContext(message, filePath, line, col, contextRadius = 1) {
    const renderFrame = (frameFilePath, frameLine, frameCol) => {
      if (!frameFilePath || !frameLine || frameLine < 1) return null;

      let contents = this.explFileObjectsByPath?.[frameFilePath]?.contents || null;
      if (!contents) return null;

      let lines = contents.split('\n');
      let start = Math.max(0, frameLine - 1 - contextRadius);
      let end = Math.min(lines.length - 1, frameLine - 1 + contextRadius);
      let width = String(end + 1).length;
      let caret = frameCol && frameCol > 0 ? frameCol : 1;

      let frame = [];
      for (let i = start; i <= end; i++) {
        let lineNumber = i + 1;
        let marker = lineNumber === frameLine ? '>' : ' ';
        let text = lines[i] || '';
        frame.push(`${marker} ${String(lineNumber).padStart(width, ' ')} | ${text}`);
        if (lineNumber === frameLine) {
          frame.push(`  ${' '.repeat(width)} | ${' '.repeat(Math.max(0, caret - 1))}^`);
        }
      }

      const locationLabel = `${frameFilePath}:${frameLine}${frameCol ? `:${frameCol}` : ''}`;
      return `${locationLabel}\n${frame.join('\n')}`;
    };

    const primaryFrame = renderFrame(filePath, line, col);
    if (!primaryFrame) return message;

    const frames = [primaryFrame];

    const referencedLocations = [];
    const referenceRegex = /(topics\/[\w./-]+\.expl):(\d+)(?::(\d+))?/g;
    for (const match of String(message).matchAll(referenceRegex)) {
      const [, referencedFilePath, lineString, colString] = match;
      const referencedLine = Number(lineString);
      const referencedCol = colString ? Number(colString) : null;
      referencedLocations.push([referencedFilePath, referencedLine, referencedCol]);
    }

    const primaryCol = col || null;

    referencedLocations
      .filter(([p, l, c]) => {
        if (!(p === filePath && l === line)) return true;
        const referencedCol = c || null;
        return !(referencedCol === primaryCol || referencedCol === null || primaryCol === null);
      })
      .filter(([p, l]) => p && l && l > 0)
      .filter(([p]) => !!this.explFileObjectsByPath?.[p]?.contents)
      .filter(([p, l, c], idx, arr) => idx === arr.findIndex(([p2, l2, c2]) => p2 === p && l2 === l && (c2 || null) === (c || null)))
      .forEach(([p, l, c]) => {
        const extraFrame = renderFrame(p, l, c);
        if (extraFrame) frames.push(extraFrame);
      });

    return `${message}\n\n${frames.join('\n\n')}\n`;
  }
}

module.exports = ParserContext;
