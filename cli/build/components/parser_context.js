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
      this.topics = {}; // by topic, { filePath, subtopics, lineNumbers, localReferences, fragmentReferenceSubtopics }
      this.deferredValidations = {
        redundantLocalReferences: [], // { enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic, reference1, reference2, referenceLocation1, referenceLocation2 }
        doubleDefinedSubtopics: [], // subtopics which are defined twice for later validation that they are subsumed and thus invalid
        subsumptionConditionalErrors: [] // errors that should be thrown if an enclosing subtopic is subsumed
      };
      this.globalReferences = {
        topicConnections: {}, // by topic, an object of other topics that that topic has outgoing global references to
        occurrences: [], // { pathString, reference, pathAndLineNumberString, referenceString, enclosingTopic, enclosingSubtopic, location }
        bySubtopic: {} // for each topic#subtopic combo, what global references / path references exist?
      };

      this.defaultTopic = new Topic(defaultTopicString); // the default topic of the project, used to log orphan topics not connected to it
      this.currentTopic = null; // the current topic file being parsed
      this.currentSubtopic = null; // the current subtopic paragraph being parsed

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

  ensureTopicData(topicCapsString, filePath) {
    this.topics[topicCapsString] = this.topics[topicCapsString] || {
      filePath: filePath || null,
      subtopics: {},
      lineNumbers: {},
      localReferences: {},
      fragmentReferenceSubtopics: []
    };
    if (filePath) this.topics[topicCapsString].filePath = filePath;
    return this.topics[topicCapsString];
  }

  // This function does a first-pass over all the expl files of the project and creates several
  // indexes of that content which will be necessary for the more in-depth second pass performed in parseBlock
  buildNamespaceObject(explFileObjectsByPath) {
    let { topics, deferredValidations } = this;

    Object.keys(explFileObjectsByPath).forEach((filePath) => {
      let fileContents = explFileObjectsByPath[filePath]?.contents;
      let paragraphsWithKeys = fileContents.split(/\n\n/);
      let topicParargaph = new Block(paragraphsWithKeys[0]);
      if (!topicParargaph.key) return;
      let currentTopic = new Topic(topicParargaph.key);
      let lineNumber = 1;

      if (topics.hasOwnProperty(currentTopic.caps)) {
        let message = dedent`Error: Topic or similar appears twice in project: [${currentTopic.mixedCase}]
        - One file is: ${topics[currentTopic.caps].filePath}
        - Another file is: ${filePath}
        `;
        throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, 1, 1)));
      } else {
        topics[currentTopic.caps] = {
          filePath,
          subtopics: {},
          lineNumbers: {},
          localReferences: {},
          fragmentReferenceSubtopics: []
        };
      }

      if (currentTopic.display.trim() !== currentTopic.display) {
        let message = `Error: Topic name [${currentTopic.display}] begins or ends with whitespace.\n` + filePath;
        throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, 1, 1)));
      }

      paragraphsWithKeys.forEach((paragraphText) => {
        if (paragraphText[0] === "\n") { // because we split on \n\n, there is only a chance that the first character is a newline
          lineNumber++;
          paragraphText = paragraphText.slice(1);
        }

        let paragraph = new Block(paragraphText);
        if (paragraph.key) {
          let currentSubtopic = new Topic(paragraph.key);

          if (topics[currentTopic.caps].subtopics.hasOwnProperty(currentSubtopic.caps)) {
            deferredValidations.doubleDefinedSubtopics.push(
              [
                currentTopic,
                currentSubtopic,
                filePath,
                topics[currentTopic.caps].lineNumbers[currentSubtopic.caps],
                lineNumber
              ]
            );
          }

          if (currentSubtopic.display.trim() !== currentSubtopic.display) {
            let message = `Error: Subtopic name [${currentSubtopic.display}] in topic [${currentTopic.display}] begins or ends with whitespace.\n\n${filePath}:${lineNumber}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, lineNumber, 1)));
          }
          topics[currentTopic.caps].subtopics[currentSubtopic.caps] = currentSubtopic;
          topics[currentTopic.caps].lineNumbers[currentSubtopic.caps] = lineNumber;
        }

        lineNumber += paragraphText.split("\n").length + 1; // length of paragraph plus additional newline separating paragraphs
      });
    });
  }

  setLineNumberToCurrentSubtopic() {
    this.lineNumber = this.topics[this.currentTopic.caps].lineNumbers[this.currentSubtopic.caps];
    this.characterNumber = 1;
  }

  setTopicAndSubtopic(topic, subtopic) {
    this.currentTopic = topic;
    this.currentSubtopic = subtopic;
    this.ensureTopicData(topic.caps, this.filePath);
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

  set filePath(filePath) {
    this.filePathString = filePath;
  }

  get filePath() {
    return this.filePathString;
  }

  getOriginalTopic(givenTopic) {
    return this.topics[givenTopic.caps]?.subtopics?.[givenTopic.caps];
  }

  getOriginalSubtopic(currentTopic, givenSubtopic) {
    if (!givenSubtopic) throw new Error('two arguments required');
    return this.topics[currentTopic.caps]?.subtopics?.[givenSubtopic.caps];
  }

  currentTopicHasSubtopic(targetSubtopic) {
    return this.topics[this.currentTopic.caps].subtopics.hasOwnProperty(targetSubtopic.caps);
  }

  topicHasSubtopic(topic, subtopic) {
    return this.topics[topic.caps]?.subtopics?.hasOwnProperty(subtopic.caps);
  }

  topicExists(topic) {
    return this.topics.hasOwnProperty(topic.caps);
  }

  pathExists(path) {
    return path.array.reduce((segment) => {
      if (!segment) return false;

      if (this.topics.hasOwnProperty(segment[0].caps) && this.topics[segment[0].caps].subtopics.hasOwnProperty(segment[1].caps)) {
        return true;
      } else {
        return false;
      }
    });
  }

  subtopicReferenceIsRedundant(targetSubtopic) {
    return this.topics[this.currentTopic.caps]?.localReferences?.[targetSubtopic.caps]?.parentSubtopic;
  }

  registerPotentialRedundantLocalReference(targetSubtopic, secondReference) {
    let firstLocation = this.topics[this.currentTopic.caps]?.localReferences?.[targetSubtopic.caps]?.location;
    let secondLocation = { line: this.lineNumber, col: this.characterNumber };
    this.deferredValidations.redundantLocalReferences.push({
      enclosingSubtopic1: this.topics[this.currentTopic.caps]?.localReferences?.[targetSubtopic.caps]?.parentSubtopic,
      enclosingSubtopic2: this.currentSubtopic,
      topic: this.currentTopic,
      referencedSubtopic: targetSubtopic,
      reference1: this.topics[this.currentTopic.caps]?.localReferences?.[targetSubtopic.caps]?.referenceText,
      reference2: secondReference.fullText,
      referenceLocation1: firstLocation,
      referenceLocation2: secondLocation
    });
  }

  registerLocalReference(targetSubtopic, index, reference) {
    const topicData = this.ensureTopicData(this.currentTopic.caps, this.filePath);
    topicData.localReferences[targetSubtopic.caps] = {
      parentSubtopic: this.currentSubtopic,
      referenceText: reference.fullText,
      location: { line: this.lineNumber, col: this.characterNumber }
    };
  }

  registerFragmentReference(reference, currentSubtopic) {
    const topicData = this.ensureTopicData(this.currentTopic.caps, this.filePath);
    topicData.fragmentReferenceSubtopics.push({
      fragmentTargetSubtopic: reference.targetAsTopic,
      enclosingSubtopic: currentSubtopic
    });
  }

  addFragmentReferenceSubtopics(callback) {
    const topicData = this.topics[this.currentTopic.caps];
    if (!topicData?.fragmentReferenceSubtopics?.length) return;

    topicData.fragmentReferenceSubtopics.forEach(({fragmentTargetSubtopic, enclosingSubtopic}) => {
      topicData.subtopics[fragmentTargetSubtopic.caps] = fragmentTargetSubtopic;
      topicData.localReferences[fragmentTargetSubtopic.caps] = {
        parentSubtopic: enclosingSubtopic,
        referenceText: null,
        location: null
      };

      callback(fragmentTargetSubtopic); // caller will know how to add topics to json object
    });
  }

  parentTopicOf(subtopic) {
    return this.topics[this.currentTopic.caps]?.localReferences?.[subtopic.caps]?.parentSubtopic;
  }

  registerSubsumptionConditionalError(errorString) {
    this.deferredValidations.subsumptionConditionalErrors.push({ // this is an error that should be thrown if the enclosing paragraph is subsumed
      enclosingTopic: this.currentTopic,
      enclosingSubtopic: this.currentSubtopic,
      errorString
    });
  }

  throwSubsumptionConditionalErrors() {
    this.deferredValidations.subsumptionConditionalErrors.forEach(errorObject => {
      if (this.hasConnection(errorObject.enclosingSubtopic, errorObject.enclosingTopic, {}, true)) {
        let path = this.topics[errorObject.enclosingTopic.caps]?.filePath;
        let line = this.topics[errorObject.enclosingTopic.caps]?.lineNumbers?.[errorObject.enclosingSubtopic.caps];
        throw new Error(chalk.red(this.formatErrorWithContext(errorObject.errorString, path, line, 1)));
      }
    });
  }

  get currentFilePathAndLineNumber() {
    return `${this.topics[this.currentTopic.caps]?.filePath}:${this.lineNumber}:${this.characterNumber}`;
  }

  validateSubtopicDefinitions() {
    this.deferredValidations.doubleDefinedSubtopics.forEach(([topic, subtopic, filePath, lineNumber1, lineNumber2]) => {
      if (this.topics[topic.caps]?.localReferences?.hasOwnProperty(subtopic.caps)) { // if the double defined subtopic gets subsumed and is accessible, it is invalid data
        let message = `Error: Subtopic [${subtopic.mixedCase}] or similar appears twice in topic: [${topic.mixedCase}]\n` +
          `First definition: ${filePath}:${lineNumber1}\n` +
          `Second definition: ${filePath}:${lineNumber2}`;
        throw new Error(chalk.red(this.formatErrorWithContext(message, filePath, lineNumber1, 1)));
      }
    });
  }

  registerGlobalReference(pathString, reference, referenceString) {
    this.globalReferences.topicConnections[this.currentTopic.caps] = this.globalReferences.topicConnections[this.currentTopic.caps] || {};
    this.globalReferences.topicConnections[this.currentTopic.caps][reference.firstTopic.caps] = true;
    this.globalReferences.topicConnections[reference.firstTopic.caps] = this.globalReferences.topicConnections[reference.firstTopic.caps] || {};

    this.globalReferences.bySubtopic[this.currentTopic.caps] =
      this.globalReferences.bySubtopic[this.currentTopic.caps] || {};
    this.globalReferences.bySubtopic[this.currentTopic.caps][this.currentSubtopic.caps] =
      this.globalReferences.bySubtopic[this.currentTopic.caps][this.currentSubtopic.caps] || {};
    this.globalReferences.bySubtopic[this.currentTopic.caps][this.currentSubtopic.caps][reference.firstTopic.caps] = true;

    this.globalReferences.occurrences.push({
      pathString,
      reference,
      pathAndLineNumberString: this.currentFilePathAndLineNumber,
      referenceString,
      enclosingTopic: this.currentTopic,
      enclosingSubtopic: this.currentSubtopic,
      location: { line: this.lineNumber, col: this.characterNumber }
    });
  }

  logGlobalOrphans() {
    this.connectedTopics = {};
    this.registerConnectedTopic(this.defaultTopic.caps);
    Object.keys(this.topics).forEach(topicCapsString => {
      let topic = this.topics[topicCapsString].subtopics[topicCapsString];
      if (!this.connectedTopics[topic.caps]) {
        console.log(chalk.magenta(
          `Warning: Global Orphan\n` +
          `Topic [${topic.mixedCase}] is not connected to the default topic [${this.defaultTopic.mixedCase}]\n` +
          `${this.topics[topic.caps].filePath}\n`
        ));
      }
    });
  }

  registerConnectedTopic(givenTopicCapsString) {
    if (!this.connectedTopics[givenTopicCapsString]) {
      this.connectedTopics[givenTopicCapsString] = true;
      Object.keys(this.globalReferences.topicConnections[givenTopicCapsString] || {}).forEach(targetTopicCapsString => this.registerConnectedTopic(targetTopicCapsString));
    }
  }

  logLocalOrphans() {
    Object.keys(this.topics).forEach(topicCapsString => {
      let topic = this.topics[topicCapsString].subtopics[topicCapsString];
      Object.keys(this.topics[topicCapsString].subtopics).forEach(subtopicCapsString => {
        let subtopic = this.topics[topicCapsString].subtopics[subtopicCapsString];
        if (!this.hasConnection(subtopic, topic)) {
          console.log(chalk.magenta(`Warning: Local Orphan\n` +
            `Subtopic [${subtopic.mixedCase}] lacks a connection to its topic [${topic.mixedCase}]\n` +
            `${this.topics[topic.caps].filePath}:${this.topics[topic.caps].lineNumbers[subtopic.caps]}\n`
          ));
        }
      });
    });
  }

  validateRedundantLocalReferences() { // see if redundant local links are in paragraphs that ended up getting subsumed
    this.deferredValidations.redundantLocalReferences.forEach(({ enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic, reference1, reference2, referenceLocation1, referenceLocation2 }) => { // are problematic links in separate real subsumed paragraphs? (You're allowed to have redundant local references in the same paragraph.)
      if (this.hasConnection(enclosingSubtopic1, topic) && this.hasConnection(enclosingSubtopic2, topic) && enclosingSubtopic1 !== enclosingSubtopic2) { // in same p allowed
        let defaultLine1 = this.topics[topic.caps].lineNumbers[enclosingSubtopic1.caps];
        let defaultLine2 = this.topics[topic.caps].lineNumbers[enclosingSubtopic2.caps];
        let line1 = referenceLocation1?.line || defaultLine1;
        let line2 = referenceLocation2?.line || defaultLine2;
        let col1 = referenceLocation1?.col || 1;
        let col2 = referenceLocation2?.col || 1;
        let filePath = this.topics[topic.caps].filePath;
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
    this.globalReferences.occurrences.forEach(({ pathString, reference, pathAndLineNumberString, referenceString, enclosingTopic, enclosingSubtopic, location }) => {
      const errorFilePath = this.topics[enclosingTopic.caps].filePath;
      const errorLine = location?.line || this.lineNumber;
      const errorCol = location?.col || this.characterNumber;

      if (this.hasConnection(enclosingSubtopic, enclosingTopic)) {
        [...pathString.matchAll(/(?:\\.|[^/])+/g)].map(match => match[0]).map(segmentString => {
          let [currentTopic, currentSubtopic] = Topic.parseUrlSegment(segmentString);

          if (!this.topicExists(currentTopic)) {
            let punctuationWarning = currentTopic.mixedCase.match(/[.,:;]/) ? '\nWarning: Using punctuation like [.,;:] can terminate a paragraph key.' : '';
            let message = `Error: Reference ${referenceString} in subtopic [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] mentions nonexistent topic or subtopic [${currentTopic.mixedCase}].\n${pathAndLineNumberString}` + punctuationWarning;
            throw new Error(chalk.red(this.formatErrorWithContext(message, errorFilePath, errorLine, errorCol)));
          }

          if (currentSubtopic && !this.topicHasSubtopic(currentTopic, currentSubtopic)) {
            let message = `Error: Subtopic [${currentTopic.mixedCase}, ${currentSubtopic.mixedCase}] referenced in reference ${referenceString} of paragraph [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] does not exist.\n${pathAndLineNumberString}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, errorFilePath, errorLine, errorCol)));
          }

          if (!this.cache && !this.hasConnection(currentSubtopic || currentTopic, currentTopic)) {
            let message = `Error: Subtopic [${currentTopic.mixedCase}, ${reference.firstSubtopic.mixedCase}] referenced in reference ${referenceString} of paragraph [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] exists but is not subsumed by given topic.\n${pathAndLineNumberString}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, errorFilePath, errorLine, errorCol)));
          }

          return segmentString;
        }).reduce((currentSegmentString, nextSegmentString) => {
          let [_, currentTopic, currentSubtopic] = currentSegmentString.match(/^((?:\\.|[^\\])+?)(?:#(.*))?$/).map(m => m && Topic.fromUrl(m));
          let [__, nextTopic] = nextSegmentString.match(/^((?:\\.|[^\\])+?)(?:#(.*))?$/).map(m => m && Topic.fromUrl(m));

          if (!this.cache && !this.globalReferences.bySubtopic[currentTopic.caps]?.[(currentSubtopic||currentTopic).caps]?.[nextTopic.caps]) {
            let message = `Error: Global reference "${referenceString}" contains invalid adjacency:\n` +
             `[${currentTopic.mixedCase}, ${(currentSubtopic||currentTopic).mixedCase}] does not reference [${nextTopic.mixedCase}]\n`+
             `${pathAndLineNumberString}`;
            throw new Error(chalk.red(this.formatErrorWithContext(message, errorFilePath, errorLine, errorCol)));
          }

          return nextSegmentString;
        });
      }
    });
  }

  hasConnection(subtopic, topic, visitedSubtopics = {}) { // Does a given subtopic have a local-reference path to the given topic?
    if (subtopic.caps === topic.caps) return true;
    if (this.topics[topic.caps]?.localReferences === null) return true; // we will proceed assuming there is a connection because this is a cache run
    if (this.topics[topic.caps]?.localReferences && !this.topics[topic.caps].localReferences[subtopic.caps]) return false;
    if (!this.topics[topic.caps]?.localReferences) return false; // there were no local references in that topic
    if (!this.topics[topic.caps].localReferences.hasOwnProperty(subtopic.caps)) return false; // no one ever referenced the subtopic
    if (visitedSubtopics[subtopic.caps]) return false; // ignore the cycle and allow other paths to continue
    visitedSubtopics[subtopic.caps] = true;
    return this.hasConnection(this.topics[topic.caps].localReferences[subtopic.caps].parentSubtopic, topic, visitedSubtopics);
  }

  formatErrorWithContext(message, filePath, line, col, contextRadius = 1) {
    const findDefinitions = (frameFilePath, frameLine, lines) => {
      let subtopicDefinition = null;
      let topicDefinition = null;
      Object.values(this.topics || {}).forEach(topicData => {
        if (topicData.filePath !== frameFilePath) return;
        if (frameFilePath.endsWith('.expl') && lines.length) {
          topicDefinition = {
            line: 1,
            text: lines[0] || ''
          };
        }
        Object.entries(topicData.lineNumbers || {}).forEach(([subtopicCaps, lineNumber]) => {
          if (!lineNumber || lineNumber > frameLine) return;
          if (!subtopicDefinition || lineNumber > subtopicDefinition.line) {
            subtopicDefinition = {
              line: lineNumber,
              text: lines[lineNumber - 1] || '',
              subtopicCaps
            };
          }
        });
      });
      return { subtopicDefinition, topicDefinition };
    };

    const renderFrame = (frameFilePath, frameLine, frameCol, { includeLocationLabel = true } = {}) => {
      if (!frameFilePath || !frameLine || frameLine < 1) return null;

      let contents = this.explFileObjectsByPath?.[frameFilePath]?.contents || null;
      if (!contents) return null;

      let lines = contents.split('\n');
      while (lines.length && lines[lines.length - 1] === '' && frameLine < lines.length) {
        lines.pop();
      }
      let start = Math.max(0, frameLine - 1 - contextRadius);
      let end = Math.min(lines.length - 1, frameLine - 1 + contextRadius);
      const { subtopicDefinition, topicDefinition } = findDefinitions(frameFilePath, frameLine, lines);
      let width = String(Math.max(end + 1, frameLine, subtopicDefinition?.line || 0, topicDefinition?.line || 0)).length;
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

      const addedDefinitions = [];
      if (
        topicDefinition &&
        topicDefinition.line < start + 1 &&
        topicDefinition.line !== frameLine &&
        topicDefinition.line !== subtopicDefinition?.line
      ) {
        addedDefinitions.push(topicDefinition);
      }
      if (
        subtopicDefinition &&
        subtopicDefinition.line < start + 1 &&
        subtopicDefinition.line !== frameLine
      ) {
        addedDefinitions.push(subtopicDefinition);
      }
      if (addedDefinitions.length) {
        addedDefinitions.sort((a, b) => a.line - b.line);
        const linesToInsert = [];
        for (let i = 0; i < addedDefinitions.length; i++) {
          const definition = addedDefinitions[i];
          linesToInsert.push(`  ${String(definition.line).padStart(width, ' ')} | ${definition.text}`);
          const nextLine = addedDefinitions[i + 1]?.line;
          if (nextLine && nextLine - definition.line > 1) {
            linesToInsert.push(`  ${' '.repeat(width)} | ...`);
          }
        }
        const lastAddedLine = addedDefinitions[addedDefinitions.length - 1].line;
        const gap = (start + 1) - lastAddedLine;
        if (gap > 1) {
          linesToInsert.push(`  ${' '.repeat(width)} | ...`);
        }
        linesToInsert.reverse().forEach(line => frame.unshift(line));
      }

      if (!includeLocationLabel) return frame.join('\n');
      const locationLabel = `${frameFilePath}:${frameLine}${frameCol ? `:${frameCol}` : ''}`;
      return `${locationLabel}\n${frame.join('\n')}`;
    };

    const referencedLocations = [];
    const referenceRegex = /(topics\/[^:\n]+?\.expl):(\d+)(?::(\d+))?/g;
    for (const match of String(message).matchAll(referenceRegex)) {
      const [, referencedFilePath, lineString, colString] = match;
      const referencedLine = Number(lineString);
      const referencedCol = colString ? Number(colString) : null;
      referencedLocations.push([referencedFilePath, referencedLine, referencedCol]);
    }

    const hasMultipleReferencedLocations = referencedLocations.length > 1;
    const primaryFrame = renderFrame(filePath, line, col, { includeLocationLabel: hasMultipleReferencedLocations });
    if (!primaryFrame) return message;

    const frames = [primaryFrame];

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
