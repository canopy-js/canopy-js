let buildNamespaceObject = require('./build_namespace_object.js');
let Topic = require('../../shared/topic');
let { LinkProximityCalculator } = require('./helpers');
let dedent = require('dedent-js');
let { ImportReferenceToken } = require('./tokens');

class parserContext {
  constructor(explFileData, defaultTopicString) {
    this.doubleDefinedSubtopics = [];
    this.topicSubtopics = buildNamespaceObject(explFileData, this.doubleDefinedSubtopics);
    this.subtopicParents = {};
    this.importReferencesToCheck = [];
    this.redundantLocalReferences = [];
    this.provisionalLocalReferences = {};
    this.defaultTopic = new Topic(defaultTopicString);
    this.topicConnections = {};
    this.currentTopic = null;
    this.currentSubtopic = null;
  }

  setTopicAndSubtopic(topicString, subtopicString) {
    this.currentTopic = new Topic(topicString);
    this.currentSubtopic = new Topic(subtopicString);
    this.subtopicParents[this.currentTopic.caps] = this.subtopicParents[this.currentTopic.caps] || {};
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

  getOriginalTopic(givenTopic) {
    return this.topicSubtopics[givenTopic.caps][givenTopic.caps];
  }

  getOriginalSubTopic(currentTopic, givenSubtopic) {
    if (!givenSubtopic) throw 'two arguments required';
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
    return this.provisionalLocalReferences[targetSubtopic.caps]
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
      text: this.text,
      index,
      enclosingTopic: this.currentTopic,
      enclosingSubtopic: this.currentSubtopic,
      linkText
    };
  }

  findImportReferenceTargetTopic(targetSubtopic, index, text) {
    let calculator = new LinkProximityCalculator(text || this.currentText);
    let linksByProximity = calculator.linksByProximity(index);

    let targetTopic = linksByProximity.map(topicString => new Topic(topicString)).find(Topic => {
      return this.topicHasSubtopic(Topic, targetSubtopic);
    });

    return targetTopic;
  }

  localReferenceCouldBeImport(targetSubtopic, index, text) {
    return !!this.findImportReferenceTargetTopic(targetSubtopic, index, text);
  }

  priorLocalReferenceCouldBeImport(targetSubtopic) {
    let {
      text,
      index
    } = this.provisionalLocalReferences[targetSubtopic.caps];

    return !!this.findImportReferenceTargetTopic(targetSubtopic, index, text);
  }

  convertPriorLocalReferenceToImport(targetSubtopic) {
    let {
      token,
      text,
      index,
      enclosingTopic,
      enclosingSubtopic,
      linkText
    } = this.provisionalLocalReferences[targetSubtopic.caps];

    let targetTopic = this.findImportReferenceTargetTopic(targetSubtopic, index, text);

    token.type = 'import';
    token.targetTopic = targetTopic.mixedCase;
    token.targetSubtopic = this.getOriginalSubTopic(targetTopic, targetSubtopic).mixedCase;
    token.enclosingTopic = enclosingTopic.mixedCase;
    token.enclosingSubtopic = enclosingSubtopic.mixedCase;
    token.text = linkText;
    token.constructor = ImportReferenceToken;
  }

  registerImportReference(enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic) {
    this.importReferencesToCheck.push([enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic, this.currentTokens]);
  }

  validateImportReferenceGlobalMatching() {
    this.importReferencesToCheck.forEach(([enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic, tokens]) => {
      tokens.filter(t => t.type === 'import').forEach(importReferenceToken => {
        let globalToken = tokens.find(
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

          throw `Error: Import reference to [${originalTargetTopic.mixedCase}, ${originalTargetSubtopic.mixedCase}] in [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] lacks global reference to topic [${originalTargetTopic.mixedCase}].`;
        }
      });
    });
  }

  validateImportReferenceTargets() {
    this.importReferencesToCheck.forEach(([enclosingTopic, enclosingSubtopic, targetTopic, targetSubtopic]) => {
      if (!this.hasConnection(targetSubtopic, targetTopic)) {
        throw `Error: Import reference in [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] is refering to unsubsumed subtopic [${targetTopic.mixedCase}, ${targetSubtopic.mixedCase}]`;
      }
    });
  }

  validateSubtopicDefinitions() {
    this.doubleDefinedSubtopics.forEach(([topic, subtopic]) => {
      if (this.subtopicParents[topic.caps]?.hasOwnProperty(subtopic.caps)) { // if the double defined subtopic gets subsumed and is accessable, it is invalid data
        throw `Error: Subtopic [${subtopic.mixedCase}] or similar appears twice in topic: [${topic.mixedCase}]`;
      }
    });
  }

  registerGlobalReference(targetTopic, currentTopic) {
    this.topicConnections[currentTopic.caps] = this.topicConnections[currentTopic.caps] || {};
    this.topicConnections[currentTopic.caps][targetTopic.caps] = true;
    this.topicConnections[targetTopic.caps] = this.topicConnections[targetTopic.caps] || {};
  }

  logGlobalOrphans() {
    this.connectedTopics = {};
    this.registerConnectedTopic(this.defaultTopic.caps);
    Object.keys(this.topicSubtopics).forEach(topicCapsString => {
      let topic = this.topicSubtopics[topicCapsString][topicCapsString];
      if (!this.connectedTopics[topic.caps]) {
        console.log()
        console.log(`Global Orphan: Topic [${topic.mixedCase}] is not connected to the default topic [${this.defaultTopic.mixedCase}]`);
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
          console.log()
          console.log(`Local Orphan: Subtopic [${subtopic.mixedCase}] lacks a connection to its topic [${topic.mixedCase}]`)
        }
      });
    });
  }

  validateRedundantLocalReferences() { // can only be done after we've seen every local reference
    this.redundantLocalReferences.forEach(([enclosingSubtopic1, enclosingSubtopic2, topic, referencedSubtopic]) => { // are problematic links in real subsumed paragraphs?
      if (this.hasConnection(enclosingSubtopic1, topic) && this.hasConnection(enclosingSubtopic2, topic)) {
        throw dedent`Error: Two local references exist in topic [${topic.mixedCase}] to subtopic [${referencedSubtopic.mixedCase}]

            - One reference is in [${topic.mixedCase}, ${enclosingSubtopic1.mixedCase}]
            - One reference is in [${topic.mixedCase}, ${enclosingSubtopic2.mixedCase}]

            Multiple local references to the same subtopic are not permitted.
            Consider making one of these local references a self-import reference.
            That would look like using [[${topic.mixedCase}#${referencedSubtopic.mixedCase}]] in the same paragraph as
            a reference to [[${topic.mixedCase}]].

            (It is also possible you meant one of these as an import reference, however,
            if both links could be either local or import references, you must clarify
            which is the import reference using explicit import syntax ie [[Other Topic#${referencedSubtopic.mixedCase}]])
            `;
      }
    });
  }

  hasConnection(subtopic, topic) { // Does a given subtopic have a local-reference path to the given topic?
    if (subtopic.caps === topic.caps) return true;
    if (this.subtopicParents[topic.caps] && !this.subtopicParents[topic.caps][subtopic.caps]) return false;
    if (!this.subtopicParents.hasOwnProperty(topic.caps)) return false; // there were no local references in that topic
    if (!this.subtopicParents[topic.caps].hasOwnProperty(subtopic.caps)) return false; // no one ever referenced the subtopic
    return this.hasConnection(this.subtopicParents[topic.caps][subtopic.caps], topic, this.subtopicParents)
  }

}

module.exports = parserContext;