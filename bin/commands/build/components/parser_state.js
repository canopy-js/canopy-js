let buildNamespaceObject = require('./build_namespace_object.js');
let { TopicName } = require('../../shared');
let { LinkProximityCalculator } = require('./helpers');
let dedent = require('dedent-js');
let { ImportReferenceToken } = require('./tokens');

class ParserState {
  constructor(explFileData) {
    this.doubleDefinedSubtopics = [];
    this.topicSubtopics = buildNamespaceObject(explFileData, this.doubleDefinedSubtopics);
    this.subtopicParents = {};
    this.importReferencesToCheck = [];
    this.redundantLocalReferences = [];
    this.provisionalLocalReferences = {};
    this.currentTopic = null;
    this.currentSubtopic = null;
  }

  setTopicAndSubtopic(topicString, subtopicString) {
    this.currentTopic = new TopicName(topicString);
    this.currentSubtopic = new TopicName(subtopicString);
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

  getOriginalTopicName(givenTopic) {
    return this.topicSubtopics[givenTopic.caps][givenTopic.caps];
  }

  getOriginalSubtopicName(currentTopic, givenSubtopic) {
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

  registerLocalReference(targetSubtopic, index, linkText) {
    this.subtopicParents[this.currentTopic.caps][targetSubtopic.caps] = this.currentSubtopic;

    this.provisionalLocalReferences[targetSubtopic.caps] = { // local references to convert to imports if found redundant
      tokens: this.tokens,
      text: this.text,
      tokenIndex: this.tokens.length + 1,
      index,
      enclosingTopic: this.currentTopic,
      enclosingSubtopic: this.currentSubtopic,
      linkText
    };
  }

  findImportReferenceTargetTopic(targetSubtopic, index, text) {
    let calculator = new LinkProximityCalculator(text || this.currentText);
    let linksByProximity = calculator.linksByProximity(index);

    let targetTopic = linksByProximity.map(topicString => new TopicName(topicString)).find(topicName => {
      return this.topicHasSubtopic(topicName, targetSubtopic);
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
      tokens,
      tokenIndex,
      text,
      index,
      enclosingTopic,
      enclosingSubtopic,
      linkText
    } = this.provisionalLocalReferences[targetSubtopic.caps];

    let targetTopic = this.findImportReferenceTargetTopic(targetSubtopic, index, text);

    let importReference = new ImportReferenceToken(
      targetTopic.mixedCase,
      this.getOriginalSubtopicName(targetTopic, targetSubtopic).mixedCase,
      enclosingTopic.mixedCase,
      enclosingSubtopic.mixedCase,
      linkText
    )

    tokens.splice(tokenIndex, 1, importReference);
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
          let targetTopicName = new TopicName(importReferenceToken.targetTopic);
          let targetSubtopicName = new TopicName(importReferenceToken.targetSubtopic);
          let targetTopic = this.getOriginalTopicName(targetTopicName);
          let targetSubtopic = this.getOriginalSubtopicName(targetTopicName, targetSubtopicName);

          throw `Error: Import reference to [${targetTopicName.mixedCase}, ${targetSubtopicName.mixedCase}] in [${enclosingTopic.mixedCase}, ${enclosingSubtopic.mixedCase}] lacks global reference to topic [${targetTopicName.mixedCase}].`;
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

module.exports = ParserState;
