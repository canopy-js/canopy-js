import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';
import { ancestorElement } from 'helpers/getters';

class Paragraph {
  // A paragraph instance represents a visible paragraph, not
  // specifically the DOM element of type paragraph.
  // As such, calls to paragraph.element actually return a
  // section element, which has a child that is of type P,
  // and other section elements as children.
  //
  // paragraph.element returns the section element, whereas
  // paragraph.paragraphElement returns the paragraph element.

  constructor(sectionElement) {
    if (!sectionElement) throw "Paragraph instantiation requires section element";
    if (!sectionElement.classList.contains('canopy-section')) throw "Paragraph class requires Canopy section element";
    this.sectionElement = sectionElement;
    this.transferDataset();
  }

  equals(otherParagraph) {
    return this.sectionElement === otherParagraph.element;
  }

  display() {
    this.element.style.display = 'block';
  }

  get element() {
    return this.sectionElement;
  }

  set element(sectionElement) {
    return this.sectionElement;
    this.transferDataset(this.sectionElement);
  }

  transferDataset() {
    this.topicName = this.sectionElement.dataset.topicName;
    this.subtopicName = this.sectionElement.dataset.subtopicName;
  }

  get topic() {
    throw "Depreciated in favor of #topicName";
  }

  get subtopic() {
    throw "Depreciated in favor of #subtopicName";
  }

  get paragraphElement() {
    return Array.from(this.element.childNodes).
      find((element) => element.tagName === 'P');
  }

  get path() {
    let pathArray = [];
    let currentElement = this.element;

    while (currentElement !== canopyContainer) {
      let currentTopic = currentElement.dataset.topicName;

      pathArray.unshift([
        currentTopic,
        currentElement.dataset.subtopicName
      ]);

      while (currentElement.dataset.topicName === currentTopic) {
        currentElement = currentElement.parentNode;
      }
    }

    return new Path(pathArray);
  }

  get pathDepth() {
    return this.sectionElement.dataset.pathDepth;
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
    return this.element.parentNode === canopyContainer
  }

  get isTopic() {
    return this.sectionElement.dataset.topicName === this.sectionElement.dataset.subtopicName;
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
    return this.linkBySelector(
      (link) => link.targetTopic === targetTopic && link.targetSubtopic === targetSubtopic
    );
  }

  get parentLink() {
    if (this.element.parentNode === canopyContainer) { return null; }

    return this.parentParagraph && this.parentParagraph.linkByTarget(
      this.element.dataset.topicName,
      this.element.dataset.subtopicName
    );
  }

  get displayTopicName() {
    return this.element.dataset.displayTopicName;
  }

  get parentParagraph() {
    if (this.element) {
      let parentElement = ancestorElement(this.element, 'canopy-section');
      return parent ? new Paragraph(parentElement) : null;
    } else {
      return null;
    }
  }

  get topicParagraph() {
    if (this.isTopic) {
      return this;
    } else {
      return new Paragraph(ancestorElement(this.element, 'canopy-topic-section'));
    }
  }

  get isTopicRoot() {
    return this.topicName === this.subtopicName;
  }

  static get current() {
    return Path.current.paragraph;
  }

  static get pageRoot() {
    let path = Path.forTopic(Path.current.firstTopic);
    return path.paragraph;
  }

  static containingLink(link) {
    if (!link instanceof Link) throw "Must provide link instance argument";
    let sectionElement = ancestorElement(link.element, 'canopy-section');
    return new Paragraph(sectionElement);
  }

}

export default Paragraph;
