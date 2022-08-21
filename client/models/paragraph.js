import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';
import { getAncestorElement } from 'helpers/getters';
import Topic from '../../bin/commands/shared/topic';

class Paragraph {
  // A paragraph instance represents a visible paragraph, not
  // specifically the DOM element of type paragraph.
  //
  // Visible paragraphs in the UI are created with a section element
  // that has a paragraph element child.
  //
  // paragraph.sectionElement returns the section element, whereas
  // paragraph.paragraphElement returns the paragraph element.

  constructor(sectionElement) {
    if (!sectionElement || sectionElement.tagName !== 'SECTION' ) throw "Paragraph instantiation requires section element";
    if (!sectionElement.classList.contains('canopy-section')) throw "Paragraph class requires Canopy section element";
    this.sectionElement = sectionElement;
    this.transferDataset();
  }

  equals(otherParagraph) {
    if (!otherParagraph) return false;
    return this.sectionElement === otherParagraph.sectionElement;
  }

  display() {
    this.sectionElement.style.display = 'block';
  }

  get element() {
    throw "Depreciated in favor of #sectionElement property";
  }

  transferDataset() {
    this._topicName = this.sectionElement.dataset.topicName;
    this._subtopicName = this.sectionElement.dataset.subtopicName;
    this.pathDepth = this.sectionElement.dataset.pathDepth;
  }

  get topic () {
    return new Topic(this.sectionElement.dataset.displayTopicName);
  }

  get subtopic () {
    return new Topic(this.sectionElement.dataset.subtopicName, true);
  }

  get topicName() {
    console.trace();
    throw "Depreciated in favor of #topic";
  }

  get subtopicName() {
    console.trace();
    throw "Depreciated in favor of #subtopic";
  }

  get paragraphElement() {
    let paragraphElement = Array.from(this.sectionElement.childNodes).
      find((element) => element.tagName === 'P');

    if (!paragraphElement) throw "Paragraph has no paragraph element";
    return paragraphElement;
  }

  get path() {
    let pathArray = [];
    let currentElement = this.sectionElement;
    let currentParagraph = this;
    let currentTopicParagraph = this.topicParagraph;

    while (currentElement !== canopyContainer) {
      currentTopicParagraph = currentParagraph.topicParagraph;

      pathArray.unshift([
        new Topic(currentElement.dataset.topicName),
        new Topic(currentElement.dataset.subtopicName)
      ]);

      while (currentElement !== canopyContainer && currentParagraph.topicParagraph.equals(currentTopicParagraph)) {
        currentElement = currentElement.parentNode;
        if (currentElement !== canopyContainer) currentParagraph = new Paragraph(currentElement);
      }
    }

    return new Path(pathArray);
  }

  get links() {
    if (this.linkObjects) return this.linkObjects;
    let linkElements = this.paragraphElement.querySelectorAll('a.canopy-selectable-link');
    this.linkObjects = Array.from(linkElements).map((element) => new Link(element));
    return this.linkObjects;
  }

  get firstLink() {
    return this.links[0] || null;
  }

  get lastLink() {
    return this.links[this.links.length - 1] || null;
  }

  get isPageRoot() {
    return this.sectionElement.parentNode === canopyContainer
  }

  get isTopic() {
    return this.topic.caps === this.subtopic.caps;
  }

  get hasLinks() {
    return this.links.length > 0;
  }

  linkBySelector(callback) {
    return this.links.find(callback);
  }

  linksBySelector(callback) {
    return this.links.filter(callback);
  }

  linkByTarget(targetTopic, targetSubtopic) {
    targetSubtopic = targetSubtopic || targetTopic;

    return this.linkBySelector(
      (link) => link.targetTopic.caps === targetTopic.caps && link.targetSubtopic.caps === targetSubtopic.caps
    );
  }

  get parentLink() {
    if (this.sectionElement.parentNode === canopyContainer) { return null; }

    return this.parentParagraph && this.parentParagraph.linkByTarget(
      this.topic,
      this.subtopic
    );
  }

  get parentLinks() {
    if (this.sectionElement.parentNode === canopyContainer) { return null; }

    return this.parentParagraph.linksBySelector(
      link => {
        return (link.isLocal || link.isGlobal) &&
          this.topic.caps === link.targetTopic.caps &&
          this.subtopic.caps === link.targetSubtopic.caps;
      }
    );
  }

  get ancestorImportReferences() {
    if (this.pageRoot) { return []; }
    if (!this.topicParagraph.parentParagraph) { return []; }

    return this.topicParagraph.parentParagraph.linksBySelector(
      link => {
        return link.isImport &&
          this.topic.caps === link.targetTopic.caps &&
          this.subtopic.caps === link.targetSubtopic.caps;
      }
    );
  }

  get displayTopicName() {
    return this.sectionElement.dataset.displayTopicName;
  }

  get parentParagraph() {
    if (this.sectionElement) {
      let parentElement = getAncestorElement(this.sectionElement, 'canopy-section');
      return parentElement ? new Paragraph(parentElement) : null;
    } else {
      return null;
    }
  }

  get topicParagraph() {
    if (this.isTopic) {
      return this;
    } else {
      return new Paragraph(getAncestorElement(this.sectionElement, 'canopy-topic-section'));
    }
  }

  get isTopicRoot() {
    return this.topicName === this.subtopicName;
  }

  static get current() {
    return new Paragraph(document.querySelector('canopy-selected-section'));
  }

  select() {
    this.sectionElement.classList.add('canopy-selected-section');
  }

  static get pageRoot() {
    let path = Path.current.rootTopicPath;
    return path.paragraph;
  }

  static containingLink(link) {
    if (!(link instanceof Link)) throw "Must provide link instance argument";
    let sectionElement = getAncestorElement(link.element, 'canopy-section');
    return new Paragraph(sectionElement);
  }

}

export default Paragraph;
